import re
import random
import textstat
import nltk
from nltk.corpus import wordnet
from ..data.ai_tells import AI_TELLS
from ..data.ai_tell_suggestions import AI_TELL_SUGGESTIONS
from ..data.cliches import CLICHES
from ..data.cliche_suggestions import CLICHE_SUGGESTIONS
from ..data.jargon import JARGON
from ..data.jargon_suggestions import JARGON_SUGGESTIONS
from ..data.em_dash_suggestions import EM_DASH_SUGGESTIONS

def get_thesaurus_synonyms(word):
    """Gets the 3-4 closest thesaurus relatives for a word."""
    synonyms = set()
    synsets = wordnet.synsets(word)
    if not synsets:
        return []
    
    main_synset = synsets[0]
    
    for lemma in main_synset.lemmas():
        synonym = lemma.name().replace('_', ' ')
        if synonym.lower() != word.lower():
            synonyms.add(synonym)
            if len(synonyms) >= 4:
                break
    
    return list(synonyms)[:4]

def clean_text_for_readability(text: str) -> str:
    """Clean text for more accurate readability calculation"""
    # Remove URLs
    text = re.sub(r'https?://\S+', '', text)
    
    # Remove HTML-like headers and formatting that break sentence detection
    text = re.sub(r'H[1-6]:\s*', '', text)  # Remove H1:, H2:, etc.
    text = re.sub(r'<[^>]+>', '', text)  # Remove any HTML tags
    text = re.sub(r'\*\*([^*]+)\*\*', r'\1', text)  # Remove markdown bold **text**
    text = re.sub(r'\*([^*]+)\*', r'\1', text)  # Remove markdown italic *text*
    
    # Convert colons followed by capital letters to periods (likely heading breaks)
    text = re.sub(r':\s+([A-Z])', r'. \1', text)
    
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

def segment_text(text: str):
    try:
        all_issues = []

        # --- Pass 1: Atomic Issues (Highest Priority) ---
        atomic_issue_types = {
            "em_dash": {"pattern": re.compile("[—–―]"), "suggestions": EM_DASH_SUGGESTIONS, "priority": 0},
            "cliche": {"pattern": re.compile('|'.join(r'(?<!\w)' + re.escape(c) + r'(?!\w)' for c in CLICHES), re.IGNORECASE), "suggestions": CLICHE_SUGGESTIONS, "priority": 1},
            "jargon": {"pattern": re.compile('|'.join(r'(?<!\w)' + re.escape(j) + r'(?!\w)' for j in JARGON), re.IGNORECASE), "suggestions": JARGON_SUGGESTIONS, "priority": 1},
            "ai_tell": {"pattern": re.compile('|'.join(r'(?<!\w)' + re.escape(a) + r'(?!\w)' for a in AI_TELLS), re.IGNORECASE), "suggestions": AI_TELL_SUGGESTIONS, "priority": 1},
        }

        for issue_type, data in atomic_issue_types.items():
            try:
                for match in data['pattern'].finditer(text):
                    all_issues.append({
                        "start": match.start(), "end": match.end(), "type": issue_type,
                        "suggestions": data.get("suggestions", {}), "priority": data['priority']
                    })
            except Exception as e:
                print(f"Error processing {issue_type}: {e}")
                continue

        # Calculate readability on cleaned text for more accurate results
        cleaned_text = clean_text_for_readability(text)
        if len(cleaned_text.strip()) > 0:
            readability_score = textstat.flesch_kincaid_grade(cleaned_text)
            
            # Debug information for readability calculation
            sentences_count = textstat.sentence_count(cleaned_text)
            words_count = textstat.lexicon_count(cleaned_text)
            syllables_count = textstat.syllable_count(cleaned_text)
            print(f"DEBUG - Segmenter Readability:")
            print(f"  Original text length: {len(text)}")
            print(f"  Cleaned text length: {len(cleaned_text)}")
            print(f"  Sentences: {sentences_count}, Words: {words_count}, Syllables: {syllables_count}")
            print(f"  FK Grade Level: {readability_score}")
            
            # Manual FK calculation for verification
            if sentences_count > 0 and words_count > 0:
                manual_fk = 0.39 * (words_count / sentences_count) + 11.8 * (syllables_count / words_count) - 15.59
                print(f"  Manual FK calculation: {manual_fk:.2f}")
            print(f"  Cleaned text sample: {cleaned_text[:200]}...")
        else:
            readability_score = 0.0
    except Exception as e:
        print(f"Error in segment_text: {e}")
        # Return basic fallback if there's any error
        return {
            "segments": [{"type": "text", "content": text, "suggestions": []}], 
            "readability_score": 0.0,
            "error": str(e)
        }

    if not all_issues:
        return {"segments": [{"type": "text", "content": text, "suggestions": []}], "readability_score": readability_score}

    points = set([0, len(text)])
    for issue in all_issues:
        points.add(issue['start'])
        points.add(issue['end'])
    
    sorted_points = sorted(list(points))

    raw_segments = []
    for i in range(len(sorted_points) - 1):
        start, end = sorted_points[i], sorted_points[i+1]
        if start >= end: continue

        content = text[start:end]
        midpoint = start + (end - start) // 2
        
        best_issue = None
        for issue in all_issues:
            if issue['start'] <= midpoint < issue['end']:
                if best_issue is None or issue['priority'] < best_issue['priority']:
                    best_issue = issue
        
        segment_type = best_issue['type'] if best_issue else 'text'
        
        suggestions = []
        if best_issue and best_issue['start'] == start and best_issue['end'] == end:
            raw_suggestions = best_issue.get('suggestions', {})
            if segment_type in ['cliche', 'ai_tell', 'jargon']:
                for key, value in raw_suggestions.items():
                    if key.lower() == content.lower():
                        suggestions = random.sample(value, min(len(value), 4))
                        break
            elif segment_type == 'em_dash':
                suggestions = raw_suggestions.get(content, [])
            else:
                suggestions = best_issue.get('suggestions', [])

        if content and content[0].isupper():
            suggestions = [s.capitalize() for s in suggestions]

        raw_segments.append({
            "type": segment_type,
            "content": content,
            "suggestions": suggestions
        })

    if not raw_segments:
        return {"segments": [], "readability_score": readability_score}

    merged_segments = []
    current_segment = raw_segments[0]

    for i in range(1, len(raw_segments)):
        next_segment = raw_segments[i]
        if next_segment['type'] == current_segment['type'] and not current_segment['suggestions'] and not next_segment['suggestions']:
            current_segment['content'] += next_segment['content']
        else:
            merged_segments.append(current_segment)
            current_segment = next_segment
    
    merged_segments.append(current_segment)

    return {"segments": merged_segments, "readability_score": readability_score}
