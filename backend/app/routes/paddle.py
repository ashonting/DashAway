from fastapi import APIRouter, Depends, HTTPException, status, Request, BackgroundTasks
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import Dict, Any
import json
import logging
from ..database import SessionLocal
from ..auth.supabase_auth import get_current_user_supabase
from ..models.user import User
from ..services.paddle_service import PaddleService
from ..schemas.paddle import (
    CheckoutSessionCreate, 
    CheckoutSessionResponse,
    UserSubscriptionInfo,
    PaddleWebhookData,
    SubscriptionManagement
)

logger = logging.getLogger(__name__)
router = APIRouter()
paddle_service = PaddleService()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/create-checkout", response_model=CheckoutSessionResponse)
async def create_checkout(
    tier: str,
    billing_cycle: str,
    current_user: User = Depends(get_current_user_supabase),
    db: Session = Depends(get_db)
):
    """Create a Paddle checkout session for subscription"""
    if not paddle_service.is_available():
        raise HTTPException(status_code=503, detail="Paddle billing is not configured. Please contact support.")
        
    try:
        # Validate tier and billing cycle
        if tier != "pro":
            raise HTTPException(status_code=400, detail="Invalid subscription tier - only 'pro' is supported")
        if billing_cycle != "monthly":
            raise HTTPException(status_code=400, detail="Invalid billing cycle - only 'monthly' is supported")

        # Get price ID from configuration
        price_config = paddle_service.pricing_config.get(tier, {}).get(billing_cycle)
        if not price_config or not price_config.get("price_id"):
            raise HTTPException(status_code=400, detail="Pricing configuration not found")

        # Create checkout session
        checkout_data = CheckoutSessionCreate(
            customer_email=current_user.email,
            price_id=price_config["price_id"],
            success_url=f"https://dashaway.io/dashboard?checkout=success",
            cancel_url=f"https://dashaway.io/pricing?checkout=cancelled",
            customer_id=current_user.paddle_customer_id
        )

        result = paddle_service.create_checkout_session(checkout_data)
        
        # Update user with customer ID if not set
        if not current_user.paddle_customer_id and hasattr(result, 'customer_id'):
            current_user.paddle_customer_id = result.customer_id
            db.commit()
        
        return result

    except Exception as e:
        logger.error(f"Error creating checkout: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create checkout session")

@router.get("/subscription-info", response_model=UserSubscriptionInfo)
async def get_subscription_info(
    current_user: User = Depends(get_current_user_supabase),
    db: Session = Depends(get_db)
):
    """Get current user's subscription information"""
    try:
        return paddle_service.get_user_subscription_info(current_user, db)
    except Exception as e:
        logger.error(f"Error getting subscription info: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get subscription information")

@router.post("/cancel-subscription")
async def cancel_subscription(
    subscription_management: SubscriptionManagement,
    current_user: User = Depends(get_current_user_supabase),
    db: Session = Depends(get_db)
):
    """Cancel user's subscription"""
    try:
        # Find user's active subscription
        from ..models.subscription import Subscription as DBSubscription
        subscription = db.query(DBSubscription).filter(
            DBSubscription.user_id == current_user.id,
            DBSubscription.status.in_(["active", "trialing", "past_due"])
        ).first()
        
        if not subscription:
            raise HTTPException(status_code=404, detail="No active subscription found")

        # Cancel immediately or at period end based on action
        cancel_immediately = subscription_management.action == "cancel_immediately"
        
        success = paddle_service.cancel_subscription(
            subscription.paddle_subscription_id,
            cancel_immediately
        )
        
        if success:
            return {"message": "Subscription cancelled successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to cancel subscription")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error cancelling subscription: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to cancel subscription")

@router.post("/webhook")
async def paddle_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Handle Paddle webhooks"""
    try:
        # Get the raw body and signature
        body = await request.body()
        signature = request.headers.get("Paddle-Signature", "")
        
        # Verify webhook signature
        if not paddle_service.verify_webhook_signature(body, signature):
            logger.warning("Invalid webhook signature")
            raise HTTPException(status_code=401, detail="Invalid signature")
        
        # Parse webhook data
        try:
            payload = json.loads(body.decode('utf-8'))
        except json.JSONDecodeError:
            logger.error("Invalid JSON in webhook payload")
            raise HTTPException(status_code=400, detail="Invalid JSON")

        # Create webhook data object
        webhook_data = PaddleWebhookData(
            event_id=payload.get("event_id", ""),
            event_type=payload.get("event_type", ""),
            occurred_at=payload.get("occurred_at", ""),
            data=payload.get("data", {})
        )

        # Process webhook in background
        background_tasks.add_task(
            process_webhook_background,
            webhook_data,
            db
        )

        # Return success immediately
        return JSONResponse(content={"status": "success"}, status_code=200)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing webhook: {str(e)}")
        raise HTTPException(status_code=500, detail="Webhook processing failed")

async def process_webhook_background(webhook_data: PaddleWebhookData, db: Session):
    """Process webhook in background task"""
    try:
        success = paddle_service.process_webhook(webhook_data, db)
        if success:
            logger.info(f"Successfully processed webhook: {webhook_data.event_type}")
        else:
            logger.error(f"Failed to process webhook: {webhook_data.event_type}")
    except Exception as e:
        logger.error(f"Background webhook processing failed: {str(e)}")

@router.get("/pricing-config")
async def get_pricing_config():
    """Get pricing configuration for frontend"""
    try:
        # Return sanitized pricing config (without internal IDs)
        config = {
            "pro": {
                "name": "Pro",
                "monthly": {
                    "price": 4,
                    "currency": "USD",
                    "features": [
                        "Unlimited document cleanings",
                        "Em-dash detection & removal (biggest AI tell)",
                        "Advanced AI phrase detection",
                        "Priority support",
                        "Export to multiple formats"
                    ]
                }
            }
        }
        return config
    except Exception as e:
        logger.error(f"Error getting pricing config: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get pricing configuration")
