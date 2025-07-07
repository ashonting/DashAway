from jargon import JARGON
from jargon_suggestions import JARGON_SUGGESTIONS

missing_jargon = [j for j in JARGON if j not in JARGON_SUGGESTIONS]

for j in missing_jargon:
    print(f'"{j}": ["suggestion1", "suggestion2", "suggestion3"],')
