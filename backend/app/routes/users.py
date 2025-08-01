from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional

from ..database import SessionLocal
from ..models.user import User
from ..models.subscription import Subscription
from ..auth.supabase_auth import get_current_user_supabase, get_current_user_optional_supabase

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class UserSyncRequest(BaseModel):
    email: str
    supabase_id: str

class UserResponse(BaseModel):
    id: int
    email: str
    usage_count: int
    subscriptions: list
    is_pro: bool

@router.get("/me")
def get_current_user_profile(
    current_user: User = Depends(get_current_user_supabase),
    db: Session = Depends(get_db)
):
    """Get current user's profile with subscription info"""
    
    # Get user's subscriptions
    subscriptions = db.query(Subscription).filter(
        Subscription.user_id == current_user.id,
        Subscription.status == "active"
    ).all()
    
    subscription_data = [
        {
            "id": sub.id,
            "paddle_subscription_id": sub.paddle_subscription_id,
            "status": sub.status
        }
        for sub in subscriptions
    ]
    
    return {
        "id": current_user.id,
        "email": current_user.email,
        "usage_count": current_user.usage_count,
        "subscriptions": subscription_data,
        "is_pro": len(subscriptions) > 0
    }

@router.post("/sync")
def sync_user_from_supabase(
    request: UserSyncRequest,
    current_user: Optional[User] = Depends(get_current_user_optional_supabase),
    db: Session = Depends(get_db)
):
    """Create or sync user from Supabase authentication"""
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == request.email).first()
    
    if existing_user:
        # User exists, return their profile
        subscriptions = db.query(Subscription).filter(
            Subscription.user_id == existing_user.id,
            Subscription.status == "active"
        ).all()
        
        subscription_data = [
            {
                "id": sub.id,
                "paddle_subscription_id": sub.paddle_subscription_id,
                "status": sub.status
            }
            for sub in subscriptions
        ]
        
        return {
            "id": existing_user.id,
            "email": existing_user.email,
            "usage_count": existing_user.usage_count,
            "subscriptions": subscription_data,
            "is_pro": len(subscriptions) > 0
        }
    
    # Create new user
    new_user = User(
        email=request.email,
        hashed_password="",  # No password for OAuth users
        usage_count=2  # Default for basic users
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {
        "id": new_user.id,
        "email": new_user.email,
        "usage_count": new_user.usage_count,
        "subscriptions": [],
        "is_pro": False
    }