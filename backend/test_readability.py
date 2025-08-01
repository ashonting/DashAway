import textstat
import re

def clean_text_for_readability(text: str) -> str:
    text = re.sub(r'https?://\S+', '', text)
    emoji_pattern = re.compile('[🍺🍻🎉✨🌟⭐💫🎯🚀💎]', flags=re.UNICODE)
    text = emoji_pattern.sub('', text)
    text = re.sub(r'[—–―]', '-', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

# Test cases
tests = {
    'Simple': 'The cat sat on the mat. It was happy.',
    'Blog Normal': 'Welcome to our brewery! We craft exceptional beers using traditional methods and innovative flavors.',
    'Long Sentence': 'This brewery, which has been operating since 1995 in downtown Portland, specializes in creating innovative craft beers that combine traditional brewing techniques with modern flavor profiles, attracting beer enthusiasts from across the Pacific Northwest who appreciate the complex interplay of hops, malts, and unique ingredients that result in award-winning ales and lagers.',
    'Technical': 'Our fermentation process utilizes temperature-controlled stainless steel vessels with specialized yeast strains to achieve optimal carbonation levels and flavor development throughout the maturation period.'
}

for name, text in tests.items():
    cleaned = clean_text_for_readability(text)
    grade = textstat.flesch_kincaid_grade(cleaned)
    words = textstat.lexicon_count(cleaned)
    sentences = textstat.sentence_count(cleaned)
    syllables = textstat.syllable_count(cleaned)
    
    print(f"{name}:")
    print(f"  Grade: {grade}")
    print(f"  Words: {words}, Sentences: {sentences}, Syllables: {syllables}")
    print(f"  Avg words/sentence: {words/sentences if sentences > 0 else 0:.1f}")
    print(f"  Avg syllables/word: {syllables/words if words > 0 else 0:.2f}")
    print()