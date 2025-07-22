from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from .subscription import Subscription

class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str

class UserPasswordUpdate(BaseModel):
    password: str

class User(UserBase):
    id: int
    is_active: bool
    usage_count: int
    last_usage_reset: Optional[datetime] = None
    # subscriptions: list[Subscription] = []

    class Config:
        from_attributes = True
