from ai_tells import AI_TELLS
from ai_tell_suggestions import AI_TELL_SUGGESTIONS

missing_ai_tells = [a for a in AI_TELLS if a not in AI_TELL_SUGGESTIONS]

for a in missing_ai_tells:
    print(f'"{a}": ["suggestion1", "suggestion2", "suggestion3"],')
