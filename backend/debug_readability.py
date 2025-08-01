#!/usr/bin/env python3

import textstat
import re

def clean_text_for_readability(text: str) -> str:
    """Clean text for more accurate readability calculation"""
    # Remove URLs
    text = re.sub(r'https?://\S+', '', text)
    
    # Remove emojis (Unicode emoji ranges)
    emoji_pattern = re.compile(
        "["
        "\U0001F600-\U0001F64F"  # emoticons
        "\U0001F300-\U0001F5FF"  # symbols & pictographs
        "\U0001F680-\U0001F6FF"  # transport & map symbols
        "\U0001F1E0-\U0001F1FF"  # flags (iOS)
        "\U00002702-\U000027B0"  # Dingbats
        "\U000024C2-\U0001F251"
        "]+", flags=re.UNICODE
    )
    text = emoji_pattern.sub('', text)
    
    # Normalize em-dashes to regular dashes for readability calculation
    text = re.sub(r'[—–―]', '-', text)
    
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    
    return text

# Test with sample texts of known difficulty levels
test_texts = {
    "Simple (Grade 3-4)": "The cat sat on the mat. It was a big cat. The cat was happy.",
    
    "Medium (Grade 8-10)": "The weather forecast predicted rain for the afternoon. Students decided to bring umbrellas to school. The temperature would drop significantly during the storm.",
    
    "Complex (Grade 12+)": "The implementation of sophisticated algorithmic frameworks necessitates comprehensive understanding of computational complexity theory and requires substantial expertise in data structure optimization.",
    
    "Blog Sample": "Welcome to our brewery! We craft exceptional beers using traditional methods. Our team focuses on quality ingredients and innovative flavors. Each batch represents months of careful planning and dedication."
}

print("=== Readability Score Debug ===\n")

for level, text in test_texts.items():
    print(f"Text Level: {level}")
    print(f"Original: {text}")
    
    cleaned = clean_text_for_readability(text)
    print(f"Cleaned: {cleaned}")
    
    # Test different readability measures
    fk_grade = textstat.flesch_kincaid_grade(cleaned)
    flesch_ease = textstat.flesch_reading_ease(cleaned)
    
    # Get detailed stats
    sentences = textstat.sentence_count(cleaned)
    words = textstat.lexicon_count(cleaned)
    syllables = textstat.syllable_count(cleaned)
    
    print(f"Stats: {sentences} sentences, {words} words, {syllables} syllables")
    print(f"Flesch-Kincaid Grade: {fk_grade}")
    print(f"Flesch Reading Ease: {flesch_ease}")
    
    # Manual calculation check
    if sentences > 0 and words > 0:
        manual_fk = 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59
        print(f"Manual FK calculation: {manual_fk:.2f}")
    
    print("-" * 50)

# Test with potential problematic content
print("\n=== Testing Edge Cases ===\n")

edge_cases = {
    "Empty": "",
    "Single Word": "Hello",
    "Numbers/Symbols": "123 $%^ &*() []{}",
    "Long Technical": "The bioavailability of pharmaceutical compounds depends on pharmacokinetic parameters including absorption, distribution, metabolism, and excretion characteristics.",
    "Short Sentences": "Go. Run. Jump. Play. Stop.",
    "One Long Sentence": "This is an extremely long sentence that contains many words and clauses and subclauses and additional phrases that might cause issues with the readability calculation algorithm and could potentially result in unexpectedly high grade level scores."
}

for case, text in edge_cases.items():
    if text:  # Skip empty for detailed analysis
        cleaned = clean_text_for_readability(text)
        fk_grade = textstat.flesch_kincaid_grade(cleaned)
        print(f"{case}: Grade {fk_grade} | Text: {text[:60]}{'...' if len(text) > 60 else ''}")