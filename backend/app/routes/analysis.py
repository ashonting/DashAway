from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.services.segmenter import segment_text

router = APIRouter()

class TextProcessRequest(BaseModel):
    text: str

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/process")
def process_text_endpoint(request: TextProcessRequest, db: Session = Depends(get_db)):
    try:
        result = segment_text(request.text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
