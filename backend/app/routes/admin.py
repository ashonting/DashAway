from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
from typing import Optional

from ..schemas import feedback as feedback_schema
from ..schemas import faq as faq_schema
from ..database import SessionLocal
from ..models.feedback import Feedback
from ..models.faq import FAQ
from ..models.user import User
from ..models.subscription import Subscription

router = APIRouter()

# Environment variables are already loaded by docker-compose env_file
# No need to load_dotenv here

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def verify_admin_password(password: str):
    """Verify admin password against environment variable"""
    admin_password = os.getenv("ADMIN_PASSWORD")
    if not admin_password:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Admin password not configured"
        )
    return password == admin_password

@router.post("/login")
def admin_login(credentials: dict):
    """Admin login endpoint"""
    password = credentials.get("password")
    if not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password required"
        )
    
    if not verify_admin_password(password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin password"
        )
    
    return {"message": "Admin authenticated successfully", "admin": True}

@router.post("/verify")
def verify_admin(credentials: dict):
    """Verify admin credentials"""
    password = credentials.get("password")
    if not password or not verify_admin_password(password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin credentials"
        )
    return {"admin": True}

@router.get("/feedback")
def get_all_feedback(password: str, db: Session = Depends(get_db)):
    """Get all user feedback - admin only"""
    if not verify_admin_password(password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin credentials"
        )
    
    feedback = db.query(Feedback).all()
    return feedback

@router.delete("/feedback/{feedback_id}")
def delete_feedback(feedback_id: int, password: str, db: Session = Depends(get_db)):
    """Delete feedback item - admin only"""
    if not verify_admin_password(password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin credentials"
        )
    
    feedback = db.query(Feedback).filter(Feedback.id == feedback_id).first()
    if not feedback:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feedback not found"
        )
    
    db.delete(feedback)
    db.commit()
    return {"message": "Feedback deleted successfully"}

@router.get("/stats")
def get_admin_stats(password: str, db: Session = Depends(get_db)):
    """Get admin statistics"""
    if not verify_admin_password(password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin credentials"
        )
    
    feedback_count = db.query(Feedback).count()
    faq_count = db.query(FAQ).count()
    
    return {
        "total_feedback": feedback_count,
        "total_faqs": faq_count
    }

@router.get("/analytics")
def get_enhanced_analytics(password: str, db: Session = Depends(get_db)):
    """Get enhanced analytics for admin dashboard"""
    if not verify_admin_password(password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin credentials"
        )
    
    # Basic user counts
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    
    # Pro user analytics - distinguish paying vs non-paying
    active_subscriptions = db.query(Subscription).filter(
        Subscription.status == 'active'
    ).count()
    
    # Count paying vs non-paying Pro users
    paying_pro_users = db.query(User).filter(
        User.subscription_tier == 'pro',
        User.is_paying == True
    ).count()
    
    non_paying_pro_users = db.query(User).filter(
        User.subscription_tier == 'pro',
        User.is_paying == False
    ).count()
    
    # Revenue calculations (only from paying Pro users)
    mrr = paying_pro_users * 4  # Monthly Recurring Revenue
    arr = mrr * 12  # Annual Recurring Revenue
    
    # Usage analytics
    total_usage = db.query(func.sum(User.usage_count)).scalar() or 0
    avg_usage_per_user = total_usage / total_users if total_users > 0 else 0
    
    # Recent activity (last 30 days)
    thirty_days_ago = datetime.now() - timedelta(days=30)
    recent_signups = db.query(User).filter(
        User.created_at >= thirty_days_ago
    ).count() if hasattr(User, 'created_at') else 0
    
    # Conversion rate (based on paying users only)
    conversion_rate = (paying_pro_users / total_users * 100) if total_users > 0 else 0
    
    # Top usage stats
    top_users = db.query(User).order_by(desc(User.usage_count)).limit(5).all()
    top_users_data = [
        {
            "email": user.email,
            "usage_count": user.usage_count,
            "is_pro": bool(db.query(Subscription).filter(
                Subscription.user_id == user.id,
                Subscription.status == 'active'
            ).first())
        }
        for user in top_users
    ]
    
    return {
        "users": {
            "total": total_users,
            "active": active_users,
            "pro": paying_pro_users + non_paying_pro_users,
            "pro_paying": paying_pro_users,
            "pro_non_paying": non_paying_pro_users,
            "free": total_users - (paying_pro_users + non_paying_pro_users),
            "recent_signups": recent_signups
        },
        "revenue": {
            "mrr": mrr,
            "arr": arr,
            "active_subscriptions": paying_pro_users,
            "average_revenue_per_user": 4 if paying_pro_users > 0 else 0
        },
        "usage": {
            "total_cleanings": total_usage,
            "average_per_user": round(avg_usage_per_user, 2),
            "top_users": top_users_data
        },
        "metrics": {
            "conversion_rate": round(conversion_rate, 2),
            "churn_rate": 0,  # Would need subscription history to calculate
            "customer_lifetime_value": 48  # Estimated $4/month * 12 months
        }
    }


@router.get("/users")
def get_users_with_search(
    password: str,
    search: Optional[str] = Query(None, description="Search by email"),
    is_pro: Optional[bool] = Query(None, description="Filter by Pro status"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    sort_by: Optional[str] = Query("email", description="Sort by field: email, usage_count, created_at"),
    sort_order: Optional[str] = Query("asc", description="Sort order: asc or desc"),
    limit: Optional[int] = Query(100, description="Limit results"),
    offset: Optional[int] = Query(0, description="Offset for pagination"),
    db: Session = Depends(get_db)
):
    """Get users with search, filtering, and sorting capabilities - admin only"""
    if not verify_admin_password(password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin credentials"
        )
    
    # Start with base query
    query = db.query(User)
    
    # Apply search filter
    if search:
        query = query.filter(User.email.ilike(f"%{search}%"))
    
    # Apply active status filter
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
    
    # Get users first, then filter by Pro status if needed
    users = query.all()
    result = []
    
    for user in users:
        # Check if user has active subscription
        subscription = db.query(Subscription).filter(
            Subscription.user_id == user.id,
            Subscription.status == 'active'
        ).first()
        
        is_user_pro = bool(subscription)
        
        # Apply Pro status filter
        if is_pro is not None and is_user_pro != is_pro:
            continue
            
        user_data = {
            "id": user.id,
            "email": user.email,
            "is_active": user.is_active,
            "usage_count": user.usage_count,
            "is_pro": is_user_pro,
            "subscription_id": subscription.paddle_subscription_id if subscription else None,
            "created_at": getattr(user, 'created_at', None)
        }
        result.append(user_data)
    
    # Sort results
    reverse = sort_order.lower() == "desc"
    if sort_by == "usage_count":
        result.sort(key=lambda x: x["usage_count"], reverse=reverse)
    elif sort_by == "created_at" and result and result[0]["created_at"]:
        result.sort(key=lambda x: x["created_at"] or datetime.min, reverse=reverse)
    else:  # Default to email
        result.sort(key=lambda x: x["email"], reverse=reverse)
    
    # Apply pagination
    total_count = len(result)
    result = result[offset:offset + limit]
    
    return {
        "users": result,
        "total": total_count,
        "offset": offset,
        "limit": limit
    }

@router.post("/make-pro/{user_id}")
def make_user_pro(user_id: int, password: str, db: Session = Depends(get_db)):
    """Make a user Pro by adding active subscription - admin only"""
    if not verify_admin_password(password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin credentials"
        )
    
    # Find the user
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if user already has active subscription
    existing_sub = db.query(Subscription).filter(
        Subscription.user_id == user_id,
        Subscription.status == 'active'
    ).first()
    
    if existing_sub:
        return {"message": f"User {user.email} is already Pro"}
    
    # Update user to Pro tier and mark as non-paying (admin granted)
    user.subscription_tier = "pro"
    user.subscription_status = "active"
    user.is_paying = False  # Admin granted, not paying
    
    # Create Pro subscription record
    subscription = Subscription(
        user_id=user_id,
        paddle_subscription_id=f"admin_pro_{user_id}",
        paddle_customer_id=f"admin_customer_{user_id}",
        paddle_product_id="admin_granted",
        paddle_price_id="admin_granted",
        status="active",
        tier="pro",
        billing_cycle="monthly",
        unit_price=0.0  # No charge for admin granted
    )
    
    db.add(subscription)
    db.commit()
    
    return {"message": f"Successfully made {user.email} a Pro member (non-paying)!"}

@router.delete("/remove-pro/{user_id}")
def remove_user_pro(user_id: int, password: str, db: Session = Depends(get_db)):
    """Remove Pro status from user - admin only"""
    if not verify_admin_password(password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin credentials"
        )
    
    # Find and remove active subscription
    subscription = db.query(Subscription).filter(
        Subscription.user_id == user_id,
        Subscription.status == 'active'
    ).first()
    
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User is not Pro or subscription not found"
        )
    
    # Reset user to free tier
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user.subscription_tier = "free"
        user.subscription_status = "inactive"
        user.is_paying = True  # Reset to default for when they might subscribe later
    
    db.delete(subscription)
    db.commit()
    
    return {"message": f"Successfully removed Pro status from {user.email if user else 'user'}"}