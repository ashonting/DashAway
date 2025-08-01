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
    
    # Pro user analytics
    active_subscriptions = db.query(Subscription).filter(
        Subscription.status == 'active'
    ).count()
    
    # Revenue calculations (assuming $4/month per Pro user)
    mrr = active_subscriptions * 4  # Monthly Recurring Revenue
    arr = mrr * 12  # Annual Recurring Revenue
    
    # Usage analytics
    total_usage = db.query(func.sum(User.usage_count)).scalar() or 0
    avg_usage_per_user = total_usage / total_users if total_users > 0 else 0
    
    # Recent activity (last 30 days)
    thirty_days_ago = datetime.now() - timedelta(days=30)
    recent_signups = db.query(User).filter(
        User.created_at >= thirty_days_ago
    ).count() if hasattr(User, 'created_at') else 0
    
    # Conversion rate
    conversion_rate = (active_subscriptions / total_users * 100) if total_users > 0 else 0
    
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
            "pro": active_subscriptions,
            "free": total_users - active_subscriptions,
            "recent_signups": recent_signups
        },
        "revenue": {
            "mrr": mrr,
            "arr": arr,
            "active_subscriptions": active_subscriptions,
            "average_revenue_per_user": 4 if active_subscriptions > 0 else 0
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

@router.post("/populate-faqs")
def populate_faqs(password: str, db: Session = Depends(get_db)):
    """Populate FAQ database with default questions - admin only"""
    if not verify_admin_password(password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin credentials"
        )
    
    # Check if FAQs already exist
    existing_count = db.query(FAQ).count()
    if existing_count > 0:
        return {"message": f"FAQs already exist ({existing_count} items). No action taken."}

    # FAQ data
    faqs_data = [
        {
            "question": "How does DashAway work?",
            "answer": "DashAway analyzes your text and identifies problematic phrases like em-dashes, clichés, jargon, and AI 'tells' that make writing sound robotic. Simply paste your text, click 'Clean Text Now,' and we'll highlight issues with suggestions for improvement."
        },
        {
            "question": "Is my text stored or used to train AI models?",
            "answer": "No, absolutely not. Your text is processed entirely in real-time and never stored on our servers. We don't use your content to train any AI models. Your writing remains completely private and secure."
        },
        {
            "question": "What's the difference between Basic and Pro accounts?",
            "answer": "Basic accounts get 2 free text cleanings per month with all core features. Pro accounts ($4/month) get unlimited cleanings, document history, advanced analytics, and priority support. Anonymous users get 1 free try without signup."
        },
        {
            "question": "Can DashAway detect AI-generated content?",
            "answer": "DashAway identifies common 'AI tells' - phrases that frequently appear in AI-generated text like 'delve into,' 'furthermore,' and 'in conclusion.' While not a definitive AI detector, it helps make AI-assisted writing sound more human and natural."
        },
        {
            "question": "What types of writing issues does DashAway find?",
            "answer": "DashAway identifies: Em-dashes that interrupt flow, overused clichés like 'game-changer,' corporate jargon like 'utilize' instead of 'use,' common AI phrases, and calculates readability scores. Complex word simplification and long sentence restructuring are coming soon."
        },
        {
            "question": "How accurate are the suggestions?",
            "answer": "Our suggestions are based on clear writing principles and extensive phrase databases. While not every suggestion will fit your style, they're designed to make writing more direct, readable, and engaging. You can accept or reject any suggestion."
        },
        {
            "question": "Can I cancel my Pro subscription anytime?",
            "answer": "Yes, you can cancel your Pro subscription at any time with no fees or penalties. Your subscription will remain active until the end of your current billing period, then automatically switch to Basic (2 uses/month)."
        },
        {
            "question": "Does DashAway work with different writing styles?",
            "answer": "Yes, DashAway focuses on objective issues like overused phrases and unclear jargon rather than subjective style choices. It works well for business writing, academic papers, blog posts, marketing copy, and creative writing."
        },
        {
            "question": "What's the character limit for text analysis?",
            "answer": "You can analyze up to 10,000 characters per submission. For longer documents, we recommend breaking them into sections or upgrading to Pro for more efficient workflow with document history."
        },
        {
            "question": "How do I get support or report bugs?",
            "answer": "Use the 'Feedback' button in the footer to report bugs or request features. For account issues, email support@dashaway.io. Pro users get priority support with faster response times."
        }
    ]
    
    try:
        # Add each FAQ
        for faq_data in faqs_data:
            faq = FAQ(
                question=faq_data["question"],
                answer=faq_data["answer"]
            )
            db.add(faq)
        
        db.commit()
        return {"message": f"Successfully added {len(faqs_data)} FAQs to the database."}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error populating FAQs: {str(e)}"
        )

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
    
    # Create Pro subscription
    subscription = Subscription(
        user_id=user_id,
        paddle_subscription_id=f"admin_pro_{user_id}",
        status="active"
    )
    
    db.add(subscription)
    db.commit()
    
    return {"message": f"Successfully made {user.email} a Pro member!"}

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
    
    db.delete(subscription)
    db.commit()
    
    user = db.query(User).filter(User.id == user_id).first()
    return {"message": f"Successfully removed Pro status from {user.email if user else 'user'}"}