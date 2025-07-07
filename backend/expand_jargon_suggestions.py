import nltk
from nltk.corpus import wordnet
from jargon_suggestions import JARGON_SUGGESTIONS

def get_synonyms(term):
    synonyms = set()
    for syn in wordnet.synsets(term):
        for lemma in syn.lemmas():
            synonyms.add(lemma.name().replace('_', ' '))
    return list(synonyms)

new_jargon_suggestions = {}
for term, suggestions in JARGON_SUGGESTIONS.items():
    new_suggestions = set(suggestions)
    synonyms = get_synonyms(term)
    for synonym in synonyms:
        new_suggestions.add(synonym)
    new_jargon_suggestions[term] = list(new_suggestions)

with open('jargon_suggestions.py', 'w') as f:
    f.write('JARGON_SUGGESTIONS = {\n')
    for term, suggestions in new_jargon_suggestions.items():
        f.write(f'    "{term}": {suggestions},\n')
    f.write('}\n')

