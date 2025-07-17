import re
import random
import textstat
import nltk
from nltk.corpus import wordnet
from app.ai_tells import AI_TELLS
from app.ai_tell_suggestions import AI_TELL_SUGGESTIONS
from app.cliches import CLICHES
from app.cliche_suggestions import CLICHE_SUGGESTIONS
from app.jargon import JARGON
from app.jargon_suggestions import JARGON_SUGGESTIONS
from app.em_dash_suggestions import EM_DASH_SUGGESTIONS

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

def segment_text(text: str):
    all_issues = []

    # --- Pass 1: Atomic Issues (Highest Priority) ---
    atomic_issue_types = {
        "em_dash": {"pattern": re.compile("[—–―]"), "suggestions": EM_DASH_SUGGESTIONS, "priority": 0},
        "cliche": {"pattern": re.compile('|'.join(r'(?<!\w)' + re.escape(c) + r'(?!\w)' for c in CLICHES), re.IGNORECASE), "suggestions": CLICHE_SUGGESTIONS, "priority": 1},
        "jargon": {"pattern": re.compile('|'.join(r'(?<!\w)' + re.escape(j) + r'(?!\w)' for j in JARGON), re.IGNORECASE), "suggestions": JARGON_SUGGESTIONS, "priority": 1},
        "ai_tell": {"pattern": re.compile('|'.join(r'(?<!\w)' + re.escape(a) + r'(?!\w)' for a in AI_TELLS), re.IGNORECASE), "suggestions": AI_TELL_SUGGESTIONS, "priority": 1},
    }

    for issue_type, data in atomic_issue_types.items():
        for match in data['pattern'].finditer(text):
            all_issues.append({
                "start": match.start(), "end": match.end(), "type": issue_type,
                "suggestions": data.get("suggestions", {}), "priority": data['priority']
            })

    readability_score = textstat.flesch_kincaid_grade(text)

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
