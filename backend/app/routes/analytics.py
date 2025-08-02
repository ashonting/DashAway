from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean
from datetime import datetime
from typing import Optional, Dict, Any
import json

from ..database import SessionLocal, Base
from ..auth.supabase_auth import get_current_user_optional_supabase
from ..models.user import User

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Analytics Event Model
class AnalyticsEvent(Base):
    __tablename__ = "analytics_events"

    id = Column(Integer, primary_key=True, index=True)
    event_name = Column(String, nullable=False, index=True)
    user_id = Column(Integer, nullable=True, index=True)  # Can be null for anonymous events
    session_id = Column(String, nullable=False, index=True)
    properties = Column(Text, nullable=True)  # JSON string
    url = Column(String, nullable=True)
    referrer = Column(String, nullable=True)
    user_agent = Column(Text, nullable=True)
    ip_address = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

# Pydantic Models
class AnalyticsEventRequest(BaseModel):
    name: str
    properties: Optional[Dict[str, Any]] = None
    sessionId: str
    userId: Optional[str] = None
    timestamp: Optional[str] = None

class AnalyticsEventResponse(BaseModel):
    success: bool
    message: str

@router.post("/events", response_model=AnalyticsEventResponse)
async def track_event(
    event: AnalyticsEventRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional_supabase)
):
    """Track an analytics event"""
    try:
        # Extract common properties
        properties = event.properties or {}
        url = properties.get('url')
        referrer = properties.get('referrer')
        user_agent = properties.get('userAgent')
        
        # Create analytics event
        db_event = AnalyticsEvent(
            event_name=event.name,
            user_id=current_user.id if current_user else None,
            session_id=event.sessionId,
            properties=json.dumps(properties) if properties else None,
            url=url,
            referrer=referrer,
            user_agent=user_agent,
            # IP address could be extracted from request headers if needed
            ip_address=None  # For privacy, we're not storing IP addresses
        )
        
        db.add(db_event)
        db.commit()
        
        return AnalyticsEventResponse(
            success=True,
            message="Event tracked successfully"
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to track event: {str(e)}"
        )

@router.get("/summary")
async def get_analytics_summary(
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_optional_supabase)
):
    """Get analytics summary for admin users"""
    # This endpoint could be protected to admin users only
    # For now, we'll return basic summary data
    
    try:
        from sqlalchemy import func, and_
        from datetime import datetime, timedelta
        
        # Calculate date range
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Total events
        total_events = db.query(AnalyticsEvent).filter(
            AnalyticsEvent.created_at >= start_date
        ).count()
        
        # Unique sessions
        unique_sessions = db.query(func.count(func.distinct(AnalyticsEvent.session_id))).filter(
            AnalyticsEvent.created_at >= start_date
        ).scalar()
        
        # Unique users
        unique_users = db.query(func.count(func.distinct(AnalyticsEvent.user_id))).filter(
            and_(
                AnalyticsEvent.created_at >= start_date,
                AnalyticsEvent.user_id.isnot(None)
            )
        ).scalar()
        
        # Top events
        top_events = db.query(
            AnalyticsEvent.event_name,
            func.count(AnalyticsEvent.id).label('count')
        ).filter(
            AnalyticsEvent.created_at >= start_date
        ).group_by(
            AnalyticsEvent.event_name
        ).order_by(
            func.count(AnalyticsEvent.id).desc()
        ).limit(10).all()
        
        # Feature usage
        feature_events = db.query(AnalyticsEvent).filter(
            and_(
                AnalyticsEvent.event_name == 'feature_used',
                AnalyticsEvent.created_at >= start_date
            )
        ).all()
        
        feature_usage = {}
        for event in feature_events:
            if event.properties:
                try:
                    props = json.loads(event.properties)
                    feature_name = props.get('feature_name')
                    if feature_name:
                        feature_usage[feature_name] = feature_usage.get(feature_name, 0) + 1
                except json.JSONDecodeError:
                    continue
        
        return {
            "total_events": total_events,
            "unique_sessions": unique_sessions,
            "unique_users": unique_users,
            "top_events": [{"name": event.event_name, "count": event.count} for event in top_events],
            "feature_usage": feature_usage,
            "date_range": {
                "start": start_date.isoformat(),
                "end": end_date.isoformat(),
                "days": days
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get analytics summary: {str(e)}"
        )

@router.get("/user-journey")
async def get_user_journey(
    session_id: Optional[str] = None,
    user_id: Optional[int] = None,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_optional_supabase)
):
    """Get user journey events for a specific session or user"""
    try:
        query = db.query(AnalyticsEvent)
        
        if session_id:
            query = query.filter(AnalyticsEvent.session_id == session_id)
        elif user_id:
            query = query.filter(AnalyticsEvent.user_id == user_id)
        elif current_user:
            # If no specific session/user requested, show current user's events
            query = query.filter(AnalyticsEvent.user_id == current_user.id)
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Must specify session_id, user_id, or be authenticated"
            )
        
        events = query.order_by(AnalyticsEvent.created_at.desc()).limit(limit).all()
        
        journey = []
        for event in events:
            event_data = {
                "event_name": event.event_name,
                "created_at": event.created_at.isoformat(),
                "url": event.url,
                "session_id": event.session_id,
            }
            
            if event.properties:
                try:
                    event_data["properties"] = json.loads(event.properties)
                except json.JSONDecodeError:
                    event_data["properties"] = {}
            
            journey.append(event_data)
        
        return {
            "journey": journey,
            "total_events": len(journey)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user journey: {str(e)}"
        )