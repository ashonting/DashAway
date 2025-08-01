import pytest
from app.services.segmenter import segment_text

def test_segment_text_em_dash():
    text = "This is a test—with an em-dash."
    result = segment_text(text)
    segments = result['segments']
    assert len(segments) == 3
    assert segments[0]['type'] == 'text'
    assert segments[1]['type'] == 'em_dash'
    assert segments[2]['type'] == 'text'

def test_segment_text_cliche():
    text = "At the end of the day, it is what it is."
    result = segment_text(text)
    segments = result['segments']
    assert any(s['type'] == 'cliche' for s in segments)
