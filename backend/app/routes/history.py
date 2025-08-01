from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..schemas import history as history_schema
from ..auth.supabase_auth import get_current_user_supabase
from ..database import SessionLocal
from ..models.history import DocumentHistory
from ..models.user import User

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=List[history_schema.DocumentHistory])
def read_history(current_user: User = Depends(get_current_user_supabase), db: Session = Depends(get_db)):
    # In a real app, you'd check if the user has a paid subscription
    # For now, we'll just return the history
    return db.query(DocumentHistory).filter(DocumentHistory.user_id == current_user.id).all()

@router.get("/count")
def get_document_count(current_user: User = Depends(get_current_user_supabase), db: Session = Depends(get_db)):
    count = db.query(DocumentHistory).filter(DocumentHistory.user_id == current_user.id).count()
    return {"count": count}

@router.post("/", response_model=history_schema.DocumentHistory)
def create_history(history: history_schema.DocumentHistoryCreate, current_user: User = Depends(get_current_user_supabase), db: Session = Depends(get_db)):
    db_history = DocumentHistory(**history.dict(), user_id=current_user.id)
    db.add(db_history)
    db.commit()
    db.refresh(db_history)
    return db_history
