import os
import json
import hmac
import hashlib
import logging
import requests
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from ..models.user import User
from ..models.subscription import Subscription as DBSubscription
from ..schemas.paddle import (
    CheckoutSessionCreate, 
    CheckoutSessionResponse,
    UserSubscriptionInfo,
    PaddleWebhookData
)

logger = logging.getLogger(__name__)

class PaddleService:
    def __init__(self):
        self.api_key = os.getenv("PADDLE_API_KEY")
        self.webhook_secret = os.getenv("PADDLE_WEBHOOK_SECRET")
        self.vendor_id = os.getenv("PADDLE_VENDOR_ID")
        
        # Use Sandbox for development, Production for live
        self.is_sandbox = os.getenv("ENVIRONMENT", "development") != "production"
        self.base_url = "https://sandbox-api.paddle.com" if self.is_sandbox else "https://api.paddle.com"
        
        if not self.api_key:
            logger.warning("PADDLE_API_KEY not found in environment variables - Paddle features will be disabled")
            self._paddle_available = False
        else:
            self._paddle_available = True
            
        if self._paddle_available:
            self.headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
        else:
            self.headers = {}
        
        # Define your product pricing
        self.pricing_config = {
            "pro": {
                "monthly": {
                    "price_id": os.getenv("PADDLE_PRO_MONTHLY_PRICE_ID"),
                    "product_id": os.getenv("PADDLE_PRO_PRODUCT_ID"),
                    "usage_limit": -1  # Unlimited for Pro plan
                }
            }
        }

    def is_available(self) -> bool:
        """Check if Paddle integration is available"""
        return self._paddle_available

    def create_checkout_session(self, session_data: CheckoutSessionCreate) -> CheckoutSessionResponse:
        """Create a Paddle checkout session for subscription"""
        if not self.is_available():
            raise Exception("Paddle integration is not configured. Please set PADDLE_API_KEY environment variable.")
            
        try:
            # Get or create customer
            customer_id = session_data.customer_id
            if not customer_id:
                customer_response = requests.post(
                    f"{self.base_url}/customers",
                    headers=self.headers,
                    json={"email": session_data.customer_email}
                )
                if customer_response.status_code == 200:
                    customer_id = customer_response.json()["data"]["id"]
                else:
                    logger.error(f"Failed to create customer: {customer_response.text}")
                    raise Exception("Customer creation failed")

            # Create transaction for subscription
            transaction_data = {
                "items": [{
                    "price_id": session_data.price_id,
                    "quantity": 1
                }],
                "customer_id": customer_id,
                "checkout": {
                    "url": session_data.success_url,
                }
            }
            
            transaction_response = requests.post(
                f"{self.base_url}/transactions",
                headers=self.headers,
                json=transaction_data
            )
            
            if transaction_response.status_code == 200:
                transaction = transaction_response.json()["data"]
                return CheckoutSessionResponse(
                    checkout_url=transaction["checkout"]["url"],
                    checkout_id=transaction["id"]
                )
            else:
                logger.error(f"Failed to create transaction: {transaction_response.text}")
                raise Exception("Transaction creation failed")
            
        except Exception as e:
            logger.error(f"Failed to create Paddle checkout session: {str(e)}")
            raise Exception(f"Checkout creation failed: {str(e)}")

    def verify_webhook_signature(self, payload: bytes, signature: str) -> bool:
        """Verify Paddle webhook signature"""
        if not self.webhook_secret:
            logger.warning("No webhook secret configured, skipping signature verification")
            return True
            
        try:
            expected_signature = hmac.new(
                self.webhook_secret.encode('utf-8'),
                payload,
                hashlib.sha256
            ).hexdigest()
            
            return hmac.compare_digest(signature, expected_signature)
        except Exception as e:
            logger.error(f"Webhook signature verification failed: {str(e)}")
            return False

    def process_webhook(self, webhook_data: PaddleWebhookData, db: Session) -> bool:
        """Process incoming Paddle webhook"""
        try:
            event_type = webhook_data.event_type
            data = webhook_data.data

            logger.info(f"Processing Paddle webhook: {event_type}")

            if event_type == "subscription.created":
                return self._handle_subscription_created(data, db)
            elif event_type == "subscription.updated":
                return self._handle_subscription_updated(data, db)
            elif event_type == "subscription.cancelled":
                return self._handle_subscription_cancelled(data, db)
            elif event_type == "subscription.paused":
                return self._handle_subscription_paused(data, db)
            elif event_type == "subscription.resumed":
                return self._handle_subscription_resumed(data, db)
            elif event_type == "transaction.completed":
                return self._handle_transaction_completed(data, db)
            elif event_type == "transaction.payment_failed":
                return self._handle_payment_failed(data, db)
            else:
                logger.warning(f"Unhandled webhook event type: {event_type}")
                return True

        except Exception as e:
            logger.error(f"Error processing webhook: {str(e)}")
            return False
    
    def _handle_subscription_created(self, data: Dict[str, Any], db: Session) -> bool:
        """Handle subscription creation"""
        try:
            subscription_data = data
            customer_id = subscription_data.get("customer_id")
            
            # Find user by Paddle customer ID
            user = db.query(User).filter(User.paddle_customer_id == customer_id).first()
            if not user:
                # Try to find by email from customer data
                customer_email = subscription_data.get("customer", {}).get("email")
                if customer_email:
                    user = db.query(User).filter(User.email == customer_email).first()
                    if user:
                        user.paddle_customer_id = customer_id
                        
            if not user:
                logger.error(f"User not found for customer_id: {customer_id}")
                return False

            # Determine tier based on product/price
            tier = self._get_tier_from_price_id(subscription_data.get("items", [{}])[0].get("price_id"))
            billing_cycle = self._get_billing_cycle_from_price_id(subscription_data.get("items", [{}])[0].get("price_id"))

            # Create subscription record
            db_subscription = DBSubscription(
                user_id=user.id,
                paddle_subscription_id=subscription_data.get("id"),
                paddle_customer_id=customer_id,
                paddle_product_id=subscription_data.get("items", [{}])[0].get("product_id"),
                paddle_price_id=subscription_data.get("items", [{}])[0].get("price_id"),
                status=subscription_data.get("status"),
                tier=tier,
                billing_cycle=billing_cycle,
                unit_price=float(subscription_data.get("items", [{}])[0].get("unit_price", {}).get("amount", 0)) / 100,
                currency=subscription_data.get("currency_code"),
                current_period_start=self._parse_datetime(subscription_data.get("current_billing_period", {}).get("starts_at")),
                current_period_end=self._parse_datetime(subscription_data.get("current_billing_period", {}).get("ends_at")),
                paddle_data=json.dumps(subscription_data)
            )
            
            db.add(db_subscription)
            
            # Update user subscription info
            user.subscription_tier = tier
            user.subscription_status = subscription_data.get("status")
            user.usage_count = self.pricing_config.get(tier, {}).get(billing_cycle, {}).get("usage_limit", 2)
            
            db.commit()
            logger.info(f"Created subscription for user {user.email}: {tier}")
            return True
            
        except Exception as e:
            logger.error(f"Error handling subscription creation: {str(e)}")
            db.rollback()
            return False

    def _handle_subscription_updated(self, data: Dict[str, Any], db: Session) -> bool:
        """Handle subscription updates"""
        try:
            subscription_id = data.get("id")
            db_subscription = db.query(DBSubscription).filter(
                DBSubscription.paddle_subscription_id == subscription_id
            ).first()
            
            if not db_subscription:
                logger.error(f"Subscription not found: {subscription_id}")
                return False

            # Update subscription data
            db_subscription.status = data.get("status")
            db_subscription.current_period_start = self._parse_datetime(data.get("current_billing_period", {}).get("starts_at"))
            db_subscription.current_period_end = self._parse_datetime(data.get("current_billing_period", {}).get("ends_at"))
            db_subscription.paddle_data = json.dumps(data)
            db_subscription.updated_at = datetime.utcnow()
            
            # Update user status
            user = db_subscription.user
            user.subscription_status = data.get("status")
            
            db.commit()
            logger.info(f"Updated subscription {subscription_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error handling subscription update: {str(e)}")
            db.rollback()
            return False

    def _handle_subscription_cancelled(self, data: Dict[str, Any], db: Session) -> bool:
        """Handle subscription cancellation"""
        try:
            subscription_id = data.get("id")
            db_subscription = db.query(DBSubscription).filter(
                DBSubscription.paddle_subscription_id == subscription_id
            ).first()
            
            if not db_subscription:
                logger.error(f"Subscription not found: {subscription_id}")
                return False

            # Update subscription
            db_subscription.status = "cancelled"
            db_subscription.cancelled_at = datetime.utcnow()
            db_subscription.cancel_at_period_end = True
            db_subscription.paddle_data = json.dumps(data)
            
            # Update user - downgrade at period end
            user = db_subscription.user
            user.subscription_status = "cancelled"
            
            db.commit()
            logger.info(f"Cancelled subscription {subscription_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error handling subscription cancellation: {str(e)}")
            db.rollback()
            return False

    def _handle_transaction_completed(self, data: Dict[str, Any], db: Session) -> bool:
        """Handle successful payment"""
        try:
            # This is mainly for logging successful payments
            logger.info(f"Payment completed for transaction: {data.get('id')}")
            return True
        except Exception as e:
            logger.error(f"Error handling transaction completion: {str(e)}")
            return False

    def _handle_payment_failed(self, data: Dict[str, Any], db: Session) -> bool:
        """Handle payment failure"""
        try:
            # Update subscription status and notify user
            subscription_id = data.get("subscription_id")
            if subscription_id:
                db_subscription = db.query(DBSubscription).filter(
                    DBSubscription.paddle_subscription_id == subscription_id
                ).first()
                
                if db_subscription:
                    db_subscription.status = "past_due"
                    user = db_subscription.user
                    user.subscription_status = "past_due"
                    db.commit()
                    
            logger.warning(f"Payment failed for transaction: {data.get('id')}")
            return True
        except Exception as e:
            logger.error(f"Error handling payment failure: {str(e)}")
            return False

    def _handle_subscription_paused(self, data: Dict[str, Any], db: Session) -> bool:
        """Handle subscription pause"""
        return self._update_subscription_status(data, db, "paused")

    def _handle_subscription_resumed(self, data: Dict[str, Any], db: Session) -> bool:
        """Handle subscription resume"""
        return self._update_subscription_status(data, db, "active")

    def _update_subscription_status(self, data: Dict[str, Any], db: Session, status: str) -> bool:
        """Generic subscription status update"""
        try:
            subscription_id = data.get("id")
            db_subscription = db.query(DBSubscription).filter(
                DBSubscription.paddle_subscription_id == subscription_id
            ).first()
            
            if db_subscription:
                db_subscription.status = status
                db_subscription.user.subscription_status = status
                db.commit()
                
            return True
        except Exception as e:
            logger.error(f"Error updating subscription status: {str(e)}")
            return False

    def get_user_subscription_info(self, user: User, db: Session) -> UserSubscriptionInfo:
        """Get comprehensive subscription info for a user"""
        try:
            # Get active subscription
            subscription = db.query(DBSubscription).filter(
                DBSubscription.user_id == user.id,
                DBSubscription.status.in_(["active", "trialing", "past_due"])
            ).first()
            
            if subscription:
                tier = subscription.tier
                usage_limit = self.pricing_config.get(tier, {}).get(subscription.billing_cycle, {}).get("usage_limit", 2)
                
                return UserSubscriptionInfo(
                    is_subscribed=True,
                    tier=tier,
                    status=subscription.status,
                    current_period_end=subscription.current_period_end,
                    cancel_at_period_end=subscription.cancel_at_period_end,
                    usage_limit=usage_limit if usage_limit != -1 else 999999,  # Unlimited
                    usage_count=user.usage_count
                )
            else:
                return UserSubscriptionInfo(
                    is_subscribed=False,
                    tier="free",
                    status="inactive",
                    current_period_end=None,
                    cancel_at_period_end=False,
                    usage_limit=2,  # Free tier limit
                    usage_count=user.usage_count
                )
                
        except Exception as e:
            logger.error(f"Error getting subscription info: {str(e)}")
            # Return safe defaults
            return UserSubscriptionInfo(
                is_subscribed=False,
                tier="free",
                status="error",
                current_period_end=None,
                cancel_at_period_end=False,
                usage_limit=2,
                usage_count=user.usage_count
            )

    def cancel_subscription(self, subscription_id: str, cancel_immediately: bool = False) -> bool:
        """Cancel a subscription"""
        try:
            effective_from = "immediately" if cancel_immediately else "next_billing_period"
            
            cancel_response = requests.post(
                f"{self.base_url}/subscriptions/{subscription_id}/cancel",
                headers=self.headers,
                json={"effective_from": effective_from}
            )
            
            if cancel_response.status_code == 200:
                return True
            else:
                logger.error(f"Failed to cancel subscription: {cancel_response.text}")
                return False
                
        except Exception as e:
            logger.error(f"Error cancelling subscription: {str(e)}")
            return False

    def _get_tier_from_price_id(self, price_id: str) -> str:
        """Determine subscription tier from price ID"""
        for tier, cycles in self.pricing_config.items():
            for cycle, config in cycles.items():
                if config.get("price_id") == price_id:
                    return tier
        return "free"

    def _get_billing_cycle_from_price_id(self, price_id: str) -> str:
        """Determine billing cycle from price ID"""
        for tier, cycles in self.pricing_config.items():
            for cycle, config in cycles.items():
                if config.get("price_id") == price_id:
                    return cycle
        return "monthly"

    def _parse_datetime(self, datetime_str: str) -> Optional[datetime]:
        """Parse Paddle datetime string"""
        if not datetime_str:
            return None
        try:
            # Paddle uses ISO 8601 format
            return datetime.fromisoformat(datetime_str.replace('Z', '+00:00'))
        except Exception as e:
            logger.error(f"Error parsing datetime {datetime_str}: {str(e)}")
            return None