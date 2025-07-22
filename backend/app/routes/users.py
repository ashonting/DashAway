from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..schemas import user as user_schema
from ..auth import auth
from ..database import SessionLocal
from ..models.user import User
from ..models.subscription import Subscription

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/me")
def read_users_me(current_user: User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    # Check if user has active subscription
    subscription = db.query(Subscription).filter(
        Subscription.user_id == current_user.id,
        Subscription.status == 'active'
    ).first()
    
    # Return user data with subscription info
    return {
        "id": current_user.id,
        "email": current_user.email,
        "is_active": current_user.is_active,
        "usage_count": current_user.usage_count,
        "last_usage_reset": current_user.last_usage_reset,
        "subscriptions": [{"status": "active", "id": subscription.id}] if subscription else []
    }

@router.put("/me/password")
def update_password(
    password_update: user_schema.UserPasswordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_user),
):
    hashed_password = auth.get_password_hash(password_update.password)
    current_user.hashed_password = hashed_password
    db.add(current_user)
    db.commit()
    return {"message": "Password updated successfully"}
