"""
Integration tests for the analysis API endpoints.

These tests verify that your API endpoints work correctly with the database
and handle authentication, usage limits, and error cases properly.
"""

import pytest
import json
from fastapi import status
from unittest.mock import patch, MagicMock


class TestProcessTextEndpoint:
    """Test the /api/process endpoint - your core business functionality."""
    
    def test_process_text_anonymous_user_success(self, client):
        """Test anonymous user can process text once."""
        text_data = {"text": "This is a test with leverage and synergy."}
        
        response = client.post("/api/process", json=text_data)
        
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        assert "segments" in data
        assert "readability_score" in data
        assert len(data["segments"]) > 0
        
        # Should detect jargon
        jargon_segments = [seg for seg in data["segments"] if seg["type"] == "jargon"]
        assert len(jargon_segments) > 0
    
    def test_process_text_anonymous_user_usage_limit(self, client):
        """Test anonymous user usage limit enforcement."""
        text_data = {"text": "Test text for processing."}
        
        # First request should succeed
        response1 = client.post("/api/process", json=text_data)
        assert response1.status_code == status.HTTP_200_OK
        
        # Second request should fail (anonymous users get 1 try)
        response2 = client.post("/api/process", json=text_data)
        assert response2.status_code == status.HTTP_403_FORBIDDEN
        assert "1 free try" in response2.json()["detail"]
    
    def test_process_text_basic_user_success(self, client, sample_user):
        """Test basic user can process text within limits."""
        text_data = {"text": "Test text with some corporate jargon like synergy."}
        
        # Mock authentication to return our sample user
        with patch('app.routes.analysis.get_current_user_optional_supabase') as mock_auth:
            mock_auth.return_value = sample_user
            
            response = client.post("/api/process", json=text_data)
            
            assert response.status_code == status.HTTP_200_OK
            data = response.json()
            assert "segments" in data
            assert "readability_score" in data
    
    def test_process_text_basic_user_usage_limit(self, client, sample_user, db_session):
        """Test basic user usage limit enforcement."""
        # Set user to have 0 usage remaining
        sample_user.usage_count = 0
        db_session.commit()
        
        text_data = {"text": "Test text"}
        
        with patch('app.routes.analysis.get_current_user_optional_supabase') as mock_auth:
            mock_auth.return_value = sample_user
            
            response = client.post("/api/process", json=text_data)
            
            assert response.status_code == status.HTTP_403_FORBIDDEN
            assert "2 monthly uses" in response.json()["detail"]
    
    def test_process_text_pro_user_unlimited(self, client, sample_pro_user):
        """Test pro user has unlimited access."""
        text_data = {"text": "Test text for pro user processing."}
        
        with patch('app.routes.analysis.get_current_user_optional_supabase') as mock_auth:
            mock_auth.return_value = sample_pro_user
            
            # Should succeed even with many requests
            for _ in range(5):
                response = client.post("/api/process", json=text_data)
                assert response.status_code == status.HTTP_200_OK
    
    def test_process_text_too_long_basic_user(self, client, sample_user):
        """Test text length limit for basic users."""
        # Create text longer than 15K characters
        long_text = "A" * 15001
        text_data = {"text": long_text}
        
        with patch('app.routes.analysis.get_current_user_optional_supabase') as mock_auth:
            mock_auth.return_value = sample_user
            
            response = client.post("/api/process", json=text_data)
            
            assert response.status_code == status.HTTP_400_BAD_REQUEST
            assert "Text too long" in response.json()["detail"]
    
    def test_process_text_long_text_pro_user(self, client, sample_pro_user):
        """Test pro users can process longer text."""
        # Create text longer than basic limit but under pro limit
        long_text = "A" * 20000  # 20K characters
        text_data = {"text": long_text}
        
        with patch('app.routes.analysis.get_current_user_optional_supabase') as mock_auth:
            mock_auth.return_value = sample_pro_user
            
            response = client.post("/api/process", json=text_data)
            
            assert response.status_code == status.HTTP_200_OK
    
    def test_process_text_invalid_json(self, client):
        """Test handling of invalid JSON input."""
        response = client.post("/api/process", data="invalid json")
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    
    def test_process_text_missing_text_field(self, client):
        """Test handling of missing text field."""
        response = client.post("/api/process", json={"not_text": "value"})
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    
    def test_process_text_empty_text(self, client):
        """Test processing empty text."""
        text_data = {"text": ""}
        
        response = client.post("/api/process", json=text_data)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["segments"] == [{"type": "text", "content": "", "suggestions": []}]
    
    @pytest.mark.database
    def test_process_text_usage_count_decremented(self, client, sample_user, db_session):
        """Test that usage count is properly decremented for basic users."""
        initial_usage = sample_user.usage_count
        text_data = {"text": "Test text"}
        
        with patch('app.routes.analysis.get_current_user_optional_supabase') as mock_auth:
            mock_auth.return_value = sample_user
            
            response = client.post("/api/process", json=text_data)
            
            assert response.status_code == status.HTTP_200_OK
            
            # Refresh user from database
            db_session.refresh(sample_user)
            assert sample_user.usage_count == initial_usage - 1
    
    @pytest.mark.database
    def test_process_text_history_saved(self, client, sample_user, db_session):
        """Test that document history is saved for authenticated users."""
        from app.models.history import DocumentHistory
        
        text_data = {"text": "Test text for history saving"}
        
        with patch('app.routes.analysis.get_current_user_optional_supabase') as mock_auth:
            mock_auth.return_value = sample_user
            
            response = client.post("/api/process", json=text_data)
            
            assert response.status_code == status.HTTP_200_OK
            
            # Check that history was saved
            history = db_session.query(DocumentHistory).filter(
                DocumentHistory.user_id == sample_user.id
            ).first()
            
            assert history is not None
            assert history.original_text == text_data["text"]
    
    @pytest.mark.database 
    def test_process_text_global_stats_updated(self, client, db_session):
        """Test that global stats are updated after processing."""
        from app.models.stats import GlobalStats
        
        # Get initial stats
        initial_stats = db_session.query(GlobalStats).first()
        initial_count = initial_stats.total_texts_cleaned if initial_stats else 0
        
        text_data = {"text": "Test text with em-dash—and jargon like synergy"}
        
        response = client.post("/api/process", json=text_data)
        assert response.status_code == status.HTTP_200_OK
        
        # Check updated stats
        updated_stats = db_session.query(GlobalStats).first()
        assert updated_stats.total_texts_cleaned == initial_count + 1
        assert updated_stats.total_em_dashes_found >= 1
        assert updated_stats.total_jargon_found >= 1


class TestReadabilityEndpoint:
    """Test the /api/readability endpoint."""
    
    def test_readability_simple_text(self, client):
        """Test readability calculation for simple text."""
        text_data = {"text": "This is simple text. It has short words."}
        
        response = client.post("/api/readability", json=text_data)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert "readability_score" in data
        assert "long_sentences" in data
        assert "complex_words" in data
        assert isinstance(data["readability_score"], (int, float))
    
    def test_readability_complex_text(self, client):
        """Test readability calculation for complex text."""
        complex_text = {
            "text": "This extraordinarily sophisticated sentence demonstrates "
                   "complicated vocabulary utilization with multisyllabic terminology."
        }
        
        response = client.post("/api/readability", json=complex_text)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # Complex text should have higher readability score (harder to read)
        assert data["readability_score"] > 5
        assert len(data["complex_words"]) > 0
    
    def test_readability_empty_text(self, client):
        """Test readability calculation for empty text."""
        text_data = {"text": ""}
        
        response = client.post("/api/readability", json=text_data)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["readability_score"] == 0.0


class TestTestAuthEndpoint:
    """Test the /api/test-auth debugging endpoint."""
    
    def test_auth_anonymous_user(self, client):
        """Test auth endpoint with anonymous user."""
        response = client.post("/api/test-auth")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert data["authenticated"] is False
        assert data["user"] is None
        assert data["user_tier"] == "anonymous"
    
    def test_auth_authenticated_user(self, client, sample_user):
        """Test auth endpoint with authenticated user."""
        with patch('app.routes.analysis.get_current_user_optional_supabase') as mock_auth:
            mock_auth.return_value = sample_user
            
            response = client.post("/api/test-auth")
            
            assert response.status_code == status.HTTP_200_OK
            data = response.json()
            
            assert data["authenticated"] is True
            assert data["user"] == sample_user.email
            assert data["user_tier"] in ["basic", "pro"]


# Error handling tests
class TestErrorHandling:
    """Test error handling in the analysis API."""
    
    def test_database_error_handling(self, client):
        """Test handling of database errors."""
        text_data = {"text": "Test text"}
        
        # Mock a database error
        with patch('app.routes.analysis.segment_text') as mock_segment:
            mock_segment.side_effect = Exception("Database connection failed")
            
            response = client.post("/api/process", json=text_data)
            
            assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
    
    def test_segmentation_service_error_handling(self, client):
        """Test handling of segmentation service errors."""
        text_data = {"text": "Test text"}
        
        # Mock a segmentation error
        with patch('app.routes.analysis.segment_text') as mock_segment:
            mock_segment.return_value = {"error": "Segmentation failed"}
            
            response = client.post("/api/process", json=text_data)
            
            # Should still return a response, possibly with error info
            assert response.status_code in [status.HTTP_200_OK, status.HTTP_500_INTERNAL_SERVER_ERROR]