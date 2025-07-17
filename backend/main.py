import os
from fastapi import FastAPI, Depends, Request, HTTPException, status
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import random
import re
import textstat
import nltk
from nltk.corpus import wordnet
from ai_tells import AI_TELLS
from ai_tell_suggestions import AI_TELL_SUGGESTIONS
from cliches import CLICHES
from cliche_suggestions import CLICHE_SUGGESTIONS
from jargon import JARGON
from jargon_suggestions import JARGON_SUGGESTIONS
from em_dash_suggestions import EM_DASH_SUGGESTIONS
from database import SessionLocal, Feedback, FAQ
from sqlalchemy.orm import Session

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class TextProcessRequest(BaseModel):
    text: str


class FeedbackRequest(BaseModel):
    feedback_type: str
    content: str


@app.on_event("startup")
def startup_event():
    db = SessionLocal()
    if db.query(FAQ).count() == 0:
        faqs = [
            FAQ(question="What is DashAway?",
                answer="DashAway is a text cleaning tool that helps you "
                       "remove em-dashes, cliches, jargon, and AI tells "
                       "from your writing."),
            FAQ(question="How do I use it?",
                answer="Simply paste your text into the left panel and click "
                       "'Clean Text'. The cleaned text will appear in the "
                       "right panel."),
            FAQ(question="Is it free?",
                answer="DashAway offers a free trial with limited usage. "
                       "You can upgrade to a paid plan for unlimited access."),
        ]
        db.add_all(faqs)
        db.commit()
    db.close()


@app.get("/")
def read_root():
    return {"message": "DashAway Backend is running"}


def get_simple_synonyms(word):
    synonyms = set()
    original_syllable_count = textstat.syllable_count(word)
    for syn in wordnet.synsets(word):
        for lemma in syn.lemmas():
            synonym = lemma.name().replace('_', ' ')
            if textstat.syllable_count(synonym) < original_syllable_count:
                synonyms.add(synonym)
    return list(synonyms)


@app.post("/process")
def process_text(request: TextProcessRequest):
    try:
        text = request.text

        issue_types = {
            "em_dash": {
                "pattern": re.compile("—"),
                "suggestions": EM_DASH_SUGGESTIONS},
            "cliche": {
                "pattern": re.compile(
                    '|'.join(
                        r'(?<!\w)' +
                        re.escape(c) +
                        r'(?!\w)' for c in CLICHES),
                    re.IGNORECASE),
                "suggestions": CLICHE_SUGGESTIONS},
            "jargon": {
                "pattern": re.compile(
                    '|'.join(
                        r'(?<!\w)' +
                        re.escape(j) +
                        r'(?!\w)' for j in JARGON),
                    re.IGNORECASE),
                "suggestions": JARGON_SUGGESTIONS},
            "ai_tell": {
                "pattern": re.compile(
                    '|'.join(
                        r'(?<!\w)' +
                        re.escape(a) +
                        r'(?!\w)' for a in AI_TELLS),
                    re.IGNORECASE),
                "suggestions": AI_TELL_SUGGESTIONS},
        }

        # Create a combined pattern to find all issues
        patterns = []
        for name, data in issue_types.items():
            patterns.append(f"(?P<{name}>{data['pattern'].pattern})")
        combined_pattern = re.compile("|".join(patterns), re.IGNORECASE)

        segments = []
        last_index = 0

        for match in combined_pattern.finditer(text):
            start, end = match.span()
            if start > last_index:
                segments.append(
                    {
                        "type": "text",
                        "content": text[last_index:start],
                        "suggestions": []
                    }
                )

            issue_type = match.lastgroup
            content = match.group()

            suggestions = []
            if issue_type in ['cliche', 'ai_tell', 'jargon']:
                # For these types, the key is the matched content itself
                for key, value in issue_types[issue_type]['suggestions'].items():
                    if key.lower() == content.lower():
                        suggestions = random.sample(value, min(len(value), 4))
                        break
            else:
                # For other types, the suggestions are in a flat dictionary
                suggestions = issue_types.get(
                    issue_type, {}).get(
                    "suggestions", {}).get(
                    content.lower(), [])

            if content[0].isupper():
                suggestions = [s.capitalize() for s in suggestions]

            segments.append(
                {
                    "type": issue_type,
                    "content": content,
                    "suggestions": suggestions
                }
            )
            last_index = end

        if last_index < len(text):
            segments.append(
                {
                    "type": "text",
                    "content": text[last_index:],
                    "suggestions": []
                }
            )

        readability_score = textstat.flesch_kincaid_grade(text)

        return {"segments": segments, "readability_score": readability_score}

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")


@app.post("/readability")
def get_readability(request: TextProcessRequest):
    try:
        text = request.text
        score = textstat.flesch_kincaid_grade(text)
        sentences = nltk.sent_tokenize(text)
        long_sentences = [
            s for s in sentences if len(
                nltk.word_tokenize(s)) > 20]
        complex_words = [
            word for word in nltk.word_tokenize(text) if textstat.syllable_count(
                word) >= 3 and word.isalpha()]
        
        return {
            "readability_score": score,
            "long_sentences": long_sentences,
            "complex_words": complex_words
        }
    except Exception as e:
        return {"error": str(e)}


@app.post("/feedback")
def receive_feedback(request: FeedbackRequest, db: Session = Depends(get_db)):
    db_feedback = Feedback(
        feedback_type=request.feedback_type, content=request.content
    )
    db.add(db_feedback)
    db.commit()
    db.refresh(db_feedback)
    return {"message": "Feedback received successfully"}


@app.get("/faq")
def get_faq(db: Session = Depends(get_db)):
    return db.query(FAQ).all()