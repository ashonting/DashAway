from pydantic import BaseModel

class SubscriptionBase(BaseModel):
    paddle_subscription_id: str
    status: str

class Subscription(SubscriptionBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
