from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..schemas import stats as stats_schema
from ..database import SessionLocal
from ..models.stats import GlobalStats

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/global", response_model=stats_schema.GlobalStats)
def read_global_stats(db: Session = Depends(get_db)):
    stats = db.query(GlobalStats).first()
    if not stats:
        stats = GlobalStats()
        db.add(stats)
        db.commit()
        db.refresh(stats)
    return stats
