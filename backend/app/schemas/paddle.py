from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime

class PaddleCustomer(BaseModel):
    id: str
    email: str
    name: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class PaddlePrice(BaseModel):
    id: str
    product_id: str
    name: str
    description: Optional[str] = None
    unit_price: float
    currency: str
    billing_cycle: str  # "month" or "year"
    trial_period: Optional[int] = None

class PaddleProduct(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    status: str

class PaddleSubscription(BaseModel):
    id: str
    customer_id: str
    status: str
    items: List[Dict[str, Any]]
    billing_cycle: str
    currency: str
    created_at: datetime
    updated_at: datetime
    current_billing_period: Optional[Dict[str, Any]] = None
    
class PaddleWebhookData(BaseModel):
    event_id: str
    event_type: str
    occurred_at: datetime
    data: Dict[str, Any]

class CheckoutSessionCreate(BaseModel):
    customer_email: str
    price_id: str
    success_url: str
    cancel_url: str
    customer_id: Optional[str] = None

class CheckoutSessionResponse(BaseModel):
    checkout_url: str
    checkout_id: str

class SubscriptionManagement(BaseModel):
    subscription_id: str
    action: str  # "cancel", "pause", "resume", "update"
    
class UserSubscriptionInfo(BaseModel):
    is_subscribed: bool
    tier: str  # "free", "pro", "premium"
    status: str
    current_period_end: Optional[datetime] = None
    cancel_at_period_end: bool = False
    usage_limit: int
    usage_count: int