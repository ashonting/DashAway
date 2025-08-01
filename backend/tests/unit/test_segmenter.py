"""
Unit tests for the text segmentation service.

These tests verify that the core business logic of DashAway 
(identifying AI tells, em-dashes, jargon, etc.) works correctly.
"""

import pytest
from app.services.segmenter import segment_text, clean_text_for_readability


class TestSegmentText:
    """Test the main text segmentation function."""
    
    def test_segment_empty_text(self):
        """Test segmenting empty text."""
        result = segment_text("")
        
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
    
    def test_segment_em_dash(self):
        """Test detection of em-dashes."""
        text = "This text has an em-dash—right here."
        result = segment_text(text)
        
        # Should have 3 segments: before, em-dash, after
        assert len(result["segments"]) == 3
        
        # Find the em-dash segment
        em_dash_segment = next(seg for seg in result["segments"] if seg["type"] == "em_dash")
        assert em_dash_segment["content"] == "—"
        assert len(em_dash_segment["suggestions"]) > 0
        assert "-" in em_dash_segment["suggestions"]  # Should suggest regular dash
    
    def test_segment_jargon(self):
        """Test detection of corporate jargon."""
        text = "We need to leverage our synergy."
        result = segment_text(text)
        
        # Should detect both "leverage" and "synergy" as jargon
        jargon_segments = [seg for seg in result["segments"] if seg["type"] == "jargon"]
        assert len(jargon_segments) == 2
        
        jargon_words = [seg["content"] for seg in jargon_segments]
        assert "leverage" in jargon_words
        assert "synergy" in jargon_words
        
        # Each jargon segment should have suggestions
        for segment in jargon_segments:
            assert len(segment["suggestions"]) > 0
    
    def test_segment_ai_tells(self):
        """Test detection of AI tells."""
        text = "Furthermore, it's important to note that this solution."
        result = segment_text(text)
        
        # Should detect AI tells
        ai_tell_segments = [seg for seg in result["segments"] if seg["type"] == "ai_tell"]
        assert len(ai_tell_segments) > 0
        
        # AI tell segments should have suggestions
        for segment in ai_tell_segments:
            assert len(segment["suggestions"]) > 0
    
    def test_segment_cliches(self):
        """Test detection of clichés."""
        text = "At the end of the day, we're all in this together."
        result = segment_text(text)
        
        # Should detect clichés
        cliche_segments = [seg for seg in result["segments"] if seg["type"] == "cliche"]
        assert len(cliche_segments) > 0
        
        # Cliché segments should have suggestions
        for segment in cliche_segments:
            assert len(segment["suggestions"]) > 0
    
    def test_segment_mixed_issues(self, sample_text_analysis):
        """Test text with multiple types of issues."""
        text = sample_text_analysis["input_text"]
        result = segment_text(text)
        
        # Should detect multiple issue types
        segment_types = [seg["type"] for seg in result["segments"]]
        assert "em_dash" in segment_types
        assert "jargon" in segment_types
        assert "text" in segment_types
        
        # Should have proper number of segments
        assert len(result["segments"]) > 3
    
    def test_segment_capitalization_preservation(self):
        """Test that capitalization is preserved in suggestions."""
        text = "Leverage this opportunity."  # Capital L
        result = segment_text(text)
        
        leverage_segment = next(seg for seg in result["segments"] 
                              if seg["type"] == "jargon" and seg["content"] == "Leverage")
        
        # Suggestions should be capitalized
        assert all(suggestion[0].isupper() for suggestion in leverage_segment["suggestions"])
    
    def test_readability_score_calculation(self):
        """Test readability score calculation."""
        simple_text = "This is simple. It has short words."
        complex_text = "This extraordinarily complicated sentence demonstrates sophisticated vocabulary utilization."
        
        simple_result = segment_text(simple_text)
        complex_result = segment_text(complex_text)
        
        # Simple text should have lower (better) readability score
        assert simple_result["readability_score"] < complex_result["readability_score"]


class TestCleanTextForReadability:
    """Test the text cleaning function for readability calculation."""
    
    def test_clean_empty_text(self):
        """Test cleaning empty text."""
        result = clean_text_for_readability("")
        assert result == ""
    
    def test_remove_urls(self):
        """Test URL removal."""
        text = "Check out https://example.com for more info."
        result = clean_text_for_readability(text)
        assert "https://example.com" not in result
        assert "Check out  for more info." == result
    
    def test_remove_markdown(self):
        """Test markdown formatting removal."""
        text = "This is **bold** and *italic* text."
        result = clean_text_for_readability(text)
        assert result == "This is bold and italic text."
    
    def test_remove_html_tags(self):
        """Test HTML tag removal."""
        text = "This has <strong>HTML</strong> tags."
        result = clean_text_for_readability(text)
        assert result == "This has HTML tags."
    
    def test_normalize_em_dashes(self):
        """Test em-dash normalization."""
        text = "Text with em-dash—and en-dash–and minus−."
        result = clean_text_for_readability(text)
        assert "—" not in result
        assert "–" not in result
        assert "−" not in result
        assert result.count("-") == 3  # All converted to regular dashes
    
    def test_remove_extra_whitespace(self):
        """Test extra whitespace removal."""
        text = "Text   with    extra     spaces."
        result = clean_text_for_readability(text)
        assert result == "Text with extra spaces."
    
    def test_convert_colons_to_periods(self):
        """Test conversion of colons followed by capital letters."""
        text = "Header: This is a new sentence."
        result = clean_text_for_readability(text)
        assert result == "Header. This is a new sentence."


# Integration test for the segmenter with real-world examples
class TestSegmenterIntegration:
    """Integration tests with real-world text examples."""
    
    @pytest.mark.integration
    def test_ai_generated_content_detection(self):
        """Test detection in typical AI-generated content."""
        ai_text = """
        Furthermore, it's important to note that leveraging synergy 
        across multiple touchpoints—while maintaining best practices—
        will undoubtedly optimize our core competencies going forward.
        """
        
        result = segment_text(ai_text)
        
        # Should detect multiple issues
        issue_types = set(seg["type"] for seg in result["segments"] if seg["type"] != "text")
        assert len(issue_types) >= 2  # At least 2 different issue types
        
        # Should have suggestions for improvements
        issues_with_suggestions = [seg for seg in result["segments"] 
                                 if seg["type"] != "text" and seg["suggestions"]]
        assert len(issues_with_suggestions) > 0
    
    @pytest.mark.integration
    def test_clean_human_content_passthrough(self):
        """Test that clean human content passes through mostly unchanged."""
        human_text = "I walked to the store yesterday. The weather was nice."
        result = segment_text(human_text)
        
        # Should mostly be text segments
        text_segments = [seg for seg in result["segments"] if seg["type"] == "text"]
        total_text_length = sum(len(seg["content"]) for seg in text_segments)
        
        # Most of the content should be unchanged
        assert total_text_length >= len(human_text) * 0.8