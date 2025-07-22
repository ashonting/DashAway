import nltk
from nltk.corpus import wordnet
from ai_tell_suggestions import AI_TELL_SUGGESTIONS

def get_synonyms(term):
    synonyms = set()
    # Skip single-word terms that are not in WordNet
    if len(term.split()) == 1:
        if not wordnet.synsets(term):
            return []
    for syn in wordnet.synsets(term):
        for lemma in syn.lemmas():
            synonyms.add(lemma.name().replace('_', ' '))
    return list(synonyms)

new_ai_tell_suggestions = {}
for term, suggestions in AI_TELL_SUGGESTIONS.items():
    new_suggestions = set(suggestions)
    synonyms = get_synonyms(term)
    for synonym in synonyms:
        new_suggestions.add(synonym)
    new_ai_tell_suggestions[term] = list(new_suggestions)

with open('app/data/ai_tell_suggestions.py', 'w') as f:
    f.write('AI_TELL_SUGGESTIONS = {\n')
    for term, suggestions in new_ai_tell_suggestions.items():
        f.write(f'    "{term}": {suggestions},\n')
    f.write('}\n')

