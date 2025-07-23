#!/usr/bin/env python3
"""
Debug script for DashAway analysis issues
Helps diagnose emoji/links errors and readability score discrepancies
"""

import textstat
import nltk
import re
import sys
from app.services.segmenter import segment_text

def test_readability_consistency():
    """Test readability calculation with various texts"""
    print("=== READABILITY TESTING ===")
    
    # Test texts with known issues
    test_texts = [
        "This is a simple sentence with basic words.",
        "This is a more complex sentence with sophisticated vocabulary and multiple clauses.",
        "🎉 This text has emojis! 😊 Let's see how it affects readability.",
        "Check out this link: https://example.com and this one too.",
        "The em-dash—a versatile punctuation mark—can cause issues sometimes.",
        """
        This is a longer paragraph with multiple sentences. It contains various elements 
        that might affect readability calculations. Some sentences are short. Others are 
        much longer and contain more complex vocabulary and grammatical structures.
        """
    ]
    
    for i, text in enumerate(test_texts, 1):
        print(f"\n--- Test {i} ---")
        print(f"Text: {text[:50]}...")
        print(f"Length: {len(text)} chars, Words: {len(text.split())}")
        
        try:
            # Direct textstat calculation
            direct_score = textstat.flesch_kincaid_grade(text)
            print(f"Direct textstat score: {direct_score}")
            
            # Through segment_text function
            result = segment_text(text)
            segment_score = result.get('readability_score')
            print(f"Segment function score: {segment_score}")
            
            # Check for differences
            if abs(direct_score - segment_score) > 0.01:
                print(f"⚠️  DISCREPANCY: {direct_score} vs {segment_score}")
            else:
                print("✅ Scores match")
                
        except Exception as e:
            print(f"❌ ERROR: {type(e).__name__}: {e}")

def test_emoji_links_processing():
    """Test text processing with emojis and links"""
    print("\n\n=== EMOJI AND LINKS TESTING ===")
    
    test_cases = [
        "Hello world! 👋",
        "🎉🎊🎈 Party time! 🥳",
        "Check this out: https://example.com",
        "Visit https://dashaway.io for more info!",
        "Mix of emoji 😊 and link https://test.com",
        "Multiple links: https://one.com and https://two.com",
        "Em-dash test—with emoji 🚀 and link https://site.com"
    ]
    
    for i, text in enumerate(test_cases, 1):
        print(f"\n--- Test {i} ---")
        print(f"Text: {text}")
        
        try:
            # Test segment_text function
            result = segment_text(text)
            print(f"✅ Processed successfully")
            print(f"Segments: {len(result['segments'])}")
            print(f"Readability: {result['readability_score']}")
            
            # Check for specific issues
            for segment in result['segments']:
                if segment['type'] != 'text':
                    print(f"  Found {segment['type']}: '{segment['content']}'")
                    
        except Exception as e:
            print(f"❌ ERROR: {type(e).__name__}: {e}")
            import traceback
            traceback.print_exc()

def test_nltk_requirements():
    """Test NLTK data requirements"""
    print("\n\n=== NLTK TESTING ===")
    
    required_data = ['punkt', 'wordnet', 'averaged_perceptron_tagger']
    
    for data_name in required_data:
        try:
            nltk.data.find(f'tokenizers/{data_name}')
            print(f"✅ {data_name} available")
        except LookupError:
            try:
                nltk.data.find(f'corpora/{data_name}')
                print(f"✅ {data_name} available")
            except LookupError:
                print(f"❌ {data_name} MISSING")
                print(f"   Run: nltk.download('{data_name}')")

def test_specific_readability():
    """Test specific readability calculation that's showing wrong scores"""
    print("\n\n=== SPECIFIC READABILITY DEBUG ===")
    
    if len(sys.argv) > 1:
        # Use text from command line if provided
        test_text = sys.argv[1]
        print(f"Testing provided text: {test_text[:100]}...")
    else:
        # Default test case
        test_text = """
        This is a sample blog post that should have a readability score around 14.4. 
        It contains moderately complex sentences with some advanced vocabulary. 
        The content flows naturally and should be accessible to most readers.
        """
    
    print(f"Text length: {len(test_text)} characters")
    print(f"Word count: {len(test_text.split())} words")
    print(f"Sentence count: {len(nltk.sent_tokenize(test_text))}")
    
    # Detailed textstat analysis
    print(f"\nTextstat Analysis:")
    print(f"  Flesch-Kincaid Grade: {textstat.flesch_kincaid_grade(test_text)}")
    print(f"  Flesch Reading Ease: {textstat.flesch_reading_ease(test_text)}")
    print(f"  Gunning Fog: {textstat.gunning_fog(test_text)}")
    print(f"  SMOG Index: {textstat.smog_index(test_text)}")
    print(f"  Coleman-Liau: {textstat.coleman_liau_index(test_text)}")
    
    # Check for special characters that might affect calculation
    special_chars = re.findall(r'[^\w\s\.\,\!\?\;\:]', test_text)
    if special_chars:
        print(f"\nSpecial characters found: {set(special_chars)}")
    
    # Test through segment_text
    result = segment_text(test_text)
    print(f"\nSegment function result: {result['readability_score']}")

if __name__ == "__main__":
    print("DashAway Analysis Debug Tool")
    print("=" * 40)
    
    test_nltk_requirements()
    test_emoji_links_processing()
    test_readability_consistency()
    test_specific_readability()