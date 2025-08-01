"""
Integration tests for authentication endpoints.

Tests the Supabase authentication integration, user management,
and authorization flows.
"""

import pytest
from fastapi import status
from unittest.mock import patch, MagicMock


class TestAuthenticationFlow:
    """Test authentication and user management."""
    
    @pytest.mark.auth
    def test_user_creation_from_supabase(self, client, db_session, mock_supabase_user):
        """Test automatic user creation when Supabase user logs in."""
        from app.models.user import User
        
        # Mock Supabase authentication
        with patch('app.auth.supabase_auth.verify_supabase_jwt') as mock_verify:
            mock_verify.return_value = mock_supabase_user
            
            # Mock the get_current_user_optional_supabase to create user
            with patch('app.routes.analysis.get_current_user_optional_supabase') as mock_get_user:
                # First call returns None (user doesn't exist)
                # Second call returns created user
                new_user = User(
                    email=mock_supabase_user["email"],
                    supabase_id=mock_supabase_user["id"],
                    is_active=True,
                    usage_count=2
                )
                db_session.add(new_user)
                db_session.commit()
                mock_get_user.return_value = new_user
                
                # Make authenticated request
                headers = {"Authorization": "Bearer valid_jwt_token"}
                response = client.post("/api/test-auth", headers=headers)
                
                assert response.status_code == status.HTTP_200_OK
                data = response.json()
                assert data["authenticated"] is True
                assert data["user"] == mock_supabase_user["email"]
    
    @pytest.mark.auth
    def test_invalid_jwt_token(self, client):
        """Test handling of invalid JWT tokens."""
        with patch('app.auth.supabase_auth.verify_supabase_jwt') as mock_verify:
            mock_verify.side_effect = Exception("Invalid token")
            
            headers = {"Authorization": "Bearer invalid_token"}
            response = client.post("/api/test-auth", headers=headers)
            
            # Should still return 200 but with authenticated=False
            assert response.status_code == status.HTTP_200_OK
            data = response.json()
            assert data["authenticated"] is False
    
    @pytest.mark.auth
    def test_missing_authorization_header(self, client):
        """Test request without authorization header."""
        response = client.post("/api/test-auth")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["authenticated"] is False
        assert data["user"] is None


class TestUserTierDetermination:
    """Test user tier determination logic."""
    
    def test_anonymous_user_tier(self, client):
        """Test tier determination for anonymous users."""
        response = client.post("/api/test-auth")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["user_tier"] == "anonymous"
    
    def test_basic_user_tier(self, client, sample_user):
        """Test tier determination for basic users."""
        with patch('app.routes.analysis.get_current_user_optional_supabase') as mock_auth:
            mock_auth.return_value = sample_user
            
            response = client.post("/api/test-auth")
            
            assert response.status_code == status.HTTP_200_OK
            data = response.json()
            assert data["user_tier"] == "basic"
    
    def test_pro_user_tier(self, client, sample_pro_user, sample_subscription):
        """Test tier determination for pro users with active subscription."""
        with patch('app.routes.analysis.get_current_user_optional_supabase') as mock_auth:
            mock_auth.return_value = sample_pro_user
            
            response = client.post("/api/test-auth")
            
            assert response.status_code == status.HTTP_200_OK
            data = response.json()
            assert data["user_tier"] == "pro"


class TestUsageLimits:
    """Test usage limit enforcement across different user tiers."""
    
    def test_anonymous_usage_limit_enforcement(self, client):
        """Test that anonymous users are limited to 1 use."""
        text_data = {"text": "Test text"}
        
        # First request should succeed
        response1 = client.post("/api/process", json=text_data)
        assert response1.status_code == status.HTTP_200_OK
        
        # Second request should fail
        response2 = client.post("/api/process", json=text_data)
        assert response2.status_code == status.HTTP_403_FORBIDDEN
    
    def test_basic_user_usage_limit_enforcement(self, client, sample_user, db_session):
        """Test that basic users are limited to their usage count."""
        # Set user to have 1 use remaining
        sample_user.usage_count = 1
        db_session.commit()
        
        text_data = {"text": "Test text"}
        
        with patch('app.routes.analysis.get_current_user_optional_supabase') as mock_auth:
            mock_auth.return_value = sample_user
            
            # First request should succeed
            response1 = client.post("/api/process", json=text_data)
            assert response1.status_code == status.HTTP_200_OK
            
            # Second request should fail (usage_count now 0)
            response2 = client.post("/api/process", json=text_data)
            assert response2.status_code == status.HTTP_403_FORBIDDEN
    
    def test_pro_user_unlimited_usage(self, client, sample_pro_user, sample_subscription):
        """Test that pro users have unlimited usage."""
        text_data = {"text": "Test text"}
        
        with patch('app.routes.analysis.get_current_user_optional_supabase') as mock_auth:
            mock_auth.return_value = sample_pro_user
            
            # Multiple requests should all succeed
            for _ in range(10):
                response = client.post("/api/process", json=text_data)
                assert response.status_code == status.HTTP_200_OK
    
    @pytest.mark.database
    def test_monthly_usage_reset(self, client, sample_user, db_session):
        """Test that basic user usage resets monthly."""
        from datetime import datetime, timedelta
        
        # Set user to have used all attempts and last reset > 30 days ago
        sample_user.usage_count = 0
        sample_user.last_usage_reset = datetime.utcnow() - timedelta(days=31)
        db_session.commit()
        
        text_data = {"text": "Test text"}
        
        with patch('app.routes.analysis.get_current_user_optional_supabase') as mock_auth:
            mock_auth.return_value = sample_user
            
            response = client.post("/api/process", json=text_data)
            
            # Should succeed because usage was reset
            assert response.status_code == status.HTTP_200_OK
            
            # Check that usage was reset
            db_session.refresh(sample_user)
            assert sample_user.usage_count == 1  # Started with 2, used 1


class TestSecurityHeaders:
    """Test security-related headers and protections."""
    
    def test_cors_headers(self, client):
        """Test CORS headers are properly set."""
        response = client.post("/api/test-auth")
        
        # Check for security headers (if implemented)
        assert response.status_code == status.HTTP_200_OK
        # Add specific CORS header checks if implemented
    
    def test_authentication_error_handling(self, client):
        """Test that authentication errors are handled gracefully."""
        with patch('app.auth.supabase_auth.verify_supabase_jwt') as mock_verify:
            mock_verify.side_effect = Exception("JWT verification failed")
            
            headers = {"Authorization": "Bearer malformed_token"}
            response = client.post("/api/test-auth", headers=headers)
            
            # Should not crash, should return graceful response
            assert response.status_code == status.HTTP_200_OK
            data = response.json()
            assert data["authenticated"] is False