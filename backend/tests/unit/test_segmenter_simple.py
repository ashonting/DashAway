"""
Simple unit tests for the segmenter service that don't require full app setup.
These tests focus purely on the business logic without database dependencies.
"""

import pytest
import sys
import os

# Add the backend directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../'))

# Set environment variables before importing app modules
os.environ["TESTING"] = "true"
os.environ["DATABASE_URL"] = "sqlite:///./test.db"
os.environ["JWT_SECRET"] = "test-secret"

from app.services.segmenter import segment_text, clean_text_for_readability


class TestSegmentTextBasic:
    """Basic tests for text segmentation without database dependencies."""
    
    def test_segment_empty_text(self):
        """Test segmenting empty text."""
        result = segment_text("")
        
        assert "segments" in result
        assert "readability_score" in result
        assert result["segments"] == [{"type": "text", "content": "", "suggestions": []}]
        assert result["readability_score"] == 0.0
    
    def test_segment_plain_text(self):
        """Test segmenting text with no issues."""
        text = "This is normal text with no problems."
        result = segment_text(text)
        
        assert len(result["segments"]) == 1
        assert result["segments"][0]["type"] == "text"
        assert result["segments"][0]["content"] == text
        assert result["segments"][0]["suggestions"] == []
        assert result["readability_score"] > 0
    
    def test_segment_em_dash_detection(self):
        """Test detection of em-dashes."""
        text = "This text has an em-dash—right here."
        result = segment_text(text)
        
        # Should have multiple segments
        assert len(result["segments"]) > 1
        
        # Find the em-dash segment
        em_dash_segments = [seg for seg in result["segments"] if seg["type"] == "em_dash"]
        assert len(em_dash_segments) == 1
        assert em_dash_segments[0]["content"] == "—"
        assert len(em_dash_segments[0]["suggestions"]) > 0
        assert "-" in em_dash_segments[0]["suggestions"]
    
    def test_segment_jargon_detection(self):
        """Test detection of corporate jargon."""
        text = "We need to leverage our synergy."
        result = segment_text(text)
        
        # Should detect jargon
        jargon_segments = [seg for seg in result["segments"] if seg["type"] == "jargon"]
        assert len(jargon_segments) >= 1
        
        # Should have suggestions for jargon
        for segment in jargon_segments:
            assert len(segment["suggestions"]) > 0
    
    def test_readability_score_exists(self):
        """Test that readability score is calculated."""
        text = "This is a test sentence for readability."
        result = segment_text(text)
        
        assert "readability_score" in result
        assert isinstance(result["readability_score"], (int, float))
        assert result["readability_score"] >= 0


class TestCleanTextBasic:
    """Basic tests for text cleaning functionality."""
    
    def test_clean_empty_text(self):
        """Test cleaning empty text."""
        result = clean_text_for_readability("")
        assert result == ""
    
    def test_clean_simple_text(self):
        """Test cleaning simple text."""
        text = "This is simple text."
        result = clean_text_for_readability(text)
        assert result == text
    
    def test_remove_urls(self):
        """Test URL removal."""
        text = "Check out https://example.com for more info."
        result = clean_text_for_readability(text)
        assert "https://example.com" not in result
    
    def test_remove_markdown(self):
        """Test markdown formatting removal."""
        text = "This is **bold** and *italic* text."
        result = clean_text_for_readability(text)
        assert "**" not in result
        assert "*" not in result
        assert "bold" in result
        assert "italic" in result
    
    def test_normalize_em_dashes(self):
        """Test em-dash normalization."""
        text = "Text with em-dash—here."
        result = clean_text_for_readability(text)
        assert "—" not in result
        assert "-" in result


if __name__ == "__main__":
    # Run tests directly if this file is executed
    pytest.main([__file__, "-v"])