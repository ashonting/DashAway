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
from database import SessionLocal, Feedback, FAQ, User
from sqlalchemy.orm import Session
from fastapi.security import (
    HTTPBearer,
    HTTPAuthorizationCredentials,
)
from jose import JWTError, jwt
import bcrypt
from datetime import datetime, timedelta

app = FastAPI()

bearer_scheme = HTTPBearer()
SECRET_KEY = os.environ.get("SECRET_KEY", "secret")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


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


class UserCreate(BaseModel):
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


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


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user


@app.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = hash_password(user.password)
    db_user = User(email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return {"message": "User created"}


@app.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == request.email).first()
    if not db_user or not verify_password(request.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    token = create_access_token({"sub": db_user.id})
    return {"access_token": token}


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

        return {"segments": segments}
    except Exception as e:
        return {"error": str(e)}


@app.post("/readability")
def get_readability(request: TextProcessRequest):
    try:
        print("--- Entering /readability endpoint ---")
        text = request.text
        print(f"Received text: {text[:100]}...")

        print("Calculating Flesch-Kincaid score...")
        score = textstat.flesch_kincaid_grade(text)
        print(f"Flesch-Kincaid score: {score}")

        print("Identifying long sentences...")
        sentences = nltk.sent_tokenize(text)
        long_sentences = [
            s for s in sentences if len(
                nltk.word_tokenize(s)) > 20]

        long_sentence_suggestions = {}
        for sentence in long_sentences:
            suggestions = []
            words = nltk.word_tokenize(sentence)
            pos_tags = nltk.pos_tag(words)

            # Check for multiple conjunctions
            conjunctions = [word for word, tag in pos_tags if tag == 'CC']
            if len(conjunctions) > 2:
                suggestions.append(
                    "This sentence has multiple conjunctions. "
                    "Consider splitting it into two or more sentences.")

            # Check for lists
            nouns = [word for word, tag in pos_tags if tag.startswith('NN')]
            if len(nouns) > 4:
                suggestions.append(
                    "This sentence appears to contain a list. "
                    "Consider using bullet points to improve readability.")

            # Check for passive voice
            passive_voice = any(
                tag in ['VBN', 'VBD'] for _,
                tag in pos_tags) and any(
                word in [
                    'is',
                    'are',
                    'was',
                    'were',
                    'be',
                    'been',
                    'being'] for word,
                _ in pos_tags)
            if passive_voice:
                suggestions.append(
                    "This sentence may be in the passive voice. Try rewriting "
                    "it in the active voice to make it more direct.")

            if not suggestions:
                suggestions.append(
                    "This sentence is long. Consider breaking it "
                    "into smaller sentences.")

            long_sentence_suggestions[sentence] = suggestions

        print(f"Found {len(long_sentences)} long sentences.")

        print("Identifying complex words...")
        words = nltk.word_tokenize(text)
        complex_words = [
            word for word in words if textstat.syllable_count(
                word) >= 3 and word.isalpha()]
        print(f"Found {len(complex_words)} complex words.")

        print("Getting synonyms for complex words...")
        complex_word_suggestions = {
            word: get_simple_synonyms(word)
            for word in complex_words
        }
        print("Finished getting synonyms.")

        response_data = {
            "readability_score": score,
            "long_sentences": long_sentence_suggestions,
            "complex_words": complex_word_suggestions,
        }
        print("--- Exiting /readability endpoint ---")
        return response_data
    except Exception as e:
        print(f"--- Error in /readability endpoint: {e} ---")
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


@app.post("/auth/paddle")
async def paddle_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.json()
    # In a real application, you would verify the webhook signature
    # and handle the event data accordingly.
    # For this prototype, we'll just log the event.
    print("Paddle webhook received:", payload)
    return {"status": "success"}


@app.get("/admin/feedback")
def get_admin_feedback(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(Feedback).all()

