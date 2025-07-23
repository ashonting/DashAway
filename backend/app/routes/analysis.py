from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..services.segmenter import segment_text
from ..models.stats import GlobalStats
from ..models.history import DocumentHistory
from ..models.subscription import Subscription
from ..auth.auth import get_current_user, get_current_user_optional
from ..models.user import User
from ..models.feedback import Feedback
from ..models.faq import FAQ
import random
import re
import textstat
import nltk
from nltk.corpus import wordnet
from datetime import datetime, timedelta
from typing import Optional
from ..data.ai_tells import AI_TELLS
from ..data.ai_tell_suggestions import AI_TELL_SUGGESTIONS
from ..data.cliches import CLICHES
from ..data.cliche_suggestions import CLICHE_SUGGESTIONS
from ..data.jargon import JARGON
from ..data.jargon_suggestions import JARGON_SUGGESTIONS
from ..data.em_dash_suggestions import EM_DASH_SUGGESTIONS

router = APIRouter()

class TextProcessRequest(BaseModel):
    text: str

class FeedbackRequest(BaseModel):
    feedback_type: str
    content: str

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/test-auth")
def test_auth(http_request: Request, current_user: Optional[User] = Depends(get_current_user_optional)):
    print("DEBUG: test-auth called")
    return {
        "user": current_user.email if current_user else None,
        "authenticated": current_user is not None
    }

@router.post("/process")
def process_text(request: TextProcessRequest, http_request: Request, response: Response, db: Session = Depends(get_db), current_user: Optional[User] = Depends(get_current_user_optional)):
    try:
        # Check usage limits and user tier
        user_tier = get_user_tier(current_user, db)
        can_use, error_message = check_usage_limits(current_user, user_tier, http_request, response)
        
        if not can_use:
            raise HTTPException(status_code=403, detail=error_message)
        
        # Process the text
        result = segment_text(request.text)
        
        # Update global stats
        update_global_stats(result, db)
        
        # Handle usage tracking and history saving based on user tier
        if user_tier == "anonymous":
            response.set_cookie("anonymous_used", "true", max_age=86400)
        elif user_tier == "basic":
            current_user.usage_count -= 1
            # Save to history for basic users
            save_to_history(current_user, request.text, result, db)
        elif user_tier == "pro":
            # Save to history for pro users
            save_to_history(current_user, request.text, result, db)
        
        db.commit()
        print("DEBUG: Database committed")
        return result
    except Exception as e:
        print(f"DEBUG: Exception caught: {type(e).__name__}: {str(e)}")
        db.rollback()
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/readability")
def get_readability(request: TextProcessRequest):
    try:
        from ..services.segmenter import clean_text_for_readability
        
        text = request.text
        cleaned_text = clean_text_for_readability(text)
        
        # Use cleaned text for more accurate readability calculation
        score = textstat.flesch_kincaid_grade(cleaned_text) if cleaned_text.strip() else 0.0
        
        # Use original text for sentence analysis (to preserve user's actual content)
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
            "complex_words": complex_words,
            "cleaned_text_length": len(cleaned_text),
            "original_text_length": len(text)
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": str(e)}

@router.post("/feedback")
def receive_feedback(request: FeedbackRequest, db: Session = Depends(get_db)):
    db_feedback = Feedback(
        feedback_type=request.feedback_type, content=request.content
    )
    db.add(db_feedback)
    db.commit()
    db.refresh(db_feedback)
    return {"message": "Feedback received successfully"}

@router.get("/faq")
def get_faq(db: Session = Depends(get_db)):
    return db.query(FAQ).all()


def get_user_tier(user: Optional[User], db: Session) -> str:
    """Determine user tier: anonymous, basic, or pro"""
    if not user:
        return "anonymous"
    
    # Check if user has active subscription
    subscription = db.query(Subscription).filter(
        Subscription.user_id == user.id,
        Subscription.status == "active"
    ).first()
    
    if subscription:
        return "pro"
    else:
        return "basic"


def check_usage_limits(user: Optional[User], tier: str, request: Request, response: Response) -> tuple[bool, str]:
    """Check if user can use the service based on their tier and usage"""
    
    if tier == "pro":
        return True, ""
    
    elif tier == "basic":
        # Check monthly reset
        if user.last_usage_reset and (datetime.utcnow() - user.last_usage_reset).days >= 30:
            user.usage_count = 2  # Reset to 2 uses per month
            user.last_usage_reset = datetime.utcnow()
        
        if user.usage_count <= 0:
            return False, "You have used your 2 monthly uses. Upgrade to Pro for unlimited access."
        return True, ""
    
    else:  # anonymous
        # Check session cookie for anonymous usage
        anonymous_used = request.cookies.get("anonymous_used", "false")
        if anonymous_used == "true":
            return False, "You have used your 1 free try. Sign up for a free account to get 2 uses per month."
        return True, ""




def save_to_history(user: User, text: str, result: dict, db: Session):
    """Save document analysis to user history"""
    try:
        # Generate a meaningful title from the first 50 characters
        title = text.strip()[:50] + ("..." if len(text.strip()) > 50 else "")
        
        history_entry = DocumentHistory(
            user_id=user.id,
            title=title,
            content=text,
            analysis_results=result
        )
        db.add(history_entry)
        print(f"DEBUG: Saved history entry for user {user.id}")
    except Exception as e:
        print(f"DEBUG: Failed to save history: {e}")
        # Don't fail the entire request if history saving fails


def update_global_stats(result: dict, db: Session):
    """Update global statistics"""
    stats = db.query(GlobalStats).first()
    if not stats:
        stats = GlobalStats()
        db.add(stats)
    
    stats.total_texts_cleaned += 1
    stats.total_em_dashes_found += len([s for s in result['segments'] if s['type'] == 'em_dash'])
    stats.total_cliches_found += len([s for s in result['segments'] if s['type'] == 'cliche'])
    stats.total_jargon_found += len([s for s in result['segments'] if s['type'] == 'jargon'])
    stats.total_ai_tells_found += len([s for s in result['segments'] if s['type'] == 'ai_tell'])
    stats.total_documents_processed += 1


@router.get("/history")
def get_user_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get document history for authenticated user"""
    history = db.query(DocumentHistory).filter(
        DocumentHistory.user_id == current_user.id
    ).order_by(DocumentHistory.created_at.desc()).limit(50).all()
    
    return [
        {
            "id": entry.id,
            "title": entry.title,
            "created_at": entry.created_at.isoformat(),
            "content": entry.content[:200] + ("..." if len(entry.content) > 200 else "")  # Preview only
        }
        for entry in history
    ]


@router.get("/history/{document_id}")
def get_document_details(document_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get full document details including analysis results"""
    document = db.query(DocumentHistory).filter(
        DocumentHistory.id == document_id,
        DocumentHistory.user_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    return {
        "id": document.id,
        "title": document.title,
        "content": document.content,
        "analysis_results": document.analysis_results,
        "created_at": document.created_at.isoformat()
    }


@router.delete("/history/{document_id}")
def delete_document(document_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Delete a document from history"""
    document = db.query(DocumentHistory).filter(
        DocumentHistory.id == document_id,
        DocumentHistory.user_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    db.delete(document)
    db.commit()
    
    return {"message": "Document deleted successfully"}
