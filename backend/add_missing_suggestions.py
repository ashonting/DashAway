from jargon import JARGON
from jargon_suggestions import JARGON_SUGGESTIONS
from ai_tells import AI_TELLS
from ai_tell_suggestions import AI_TELL_SUGGESTIONS
from cliches import CLICHES
from cliche_suggestions import CLICHE_SUGGESTIONS


def add_missing_suggestions(issue_list, suggestions_dict, dict_name, filename):
    missing_keys = [key for key in issue_list 
                    if key.lower() not in suggestions_dict]
    if not missing_keys:
        print(f"All items in {dict_name} are already in the suggestions dictionary.")
        return

    with open(filename, "a") as f:
        f.write("\n\n# Added by script\n")
        for key in missing_keys:
            f.write(f'    "{key.lower()}": [],\n')
    print(f"Added {len(missing_keys)} missing items to {filename}")


if __name__ == "__main__":
    add_missing_suggestions(JARGON, JARGON_SUGGESTIONS, "JARGON", 
                            "jargon_suggestions.py")
    add_missing_suggestions(AI_TELLS, AI_TELL_SUGGESTIONS, "AI_TELLS", 
                            "ai_tell_suggestions.py")
    add_missing_suggestions(CLICHES, CLICHE_SUGGESTIONS, "CLICHES", 
                            "cliche_suggestions.py")