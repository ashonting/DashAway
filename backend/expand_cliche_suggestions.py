import nltk
from nltk.corpus import wordnet
from cliche_suggestions import CLICHE_SUGGESTIONS

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

new_cliche_suggestions = {}
for term, suggestions in CLICHE_SUGGESTIONS.items():
    new_suggestions = set(suggestions)
    synonyms = get_synonyms(term)
    for synonym in synonyms:
        new_suggestions.add(synonym)
    new_cliche_suggestions[term] = list(new_suggestions)

with open('app/data/cliche_suggestions.py', 'w') as f:
    f.write('CLICHE_SUGGESTIONS = {\n')
    for term, suggestions in new_cliche_suggestions.items():
        f.write(f'    "{term}": {suggestions},\n')
    f.write('}\n')

