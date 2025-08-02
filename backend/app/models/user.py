from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from ..database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    usage_count = Column(Integer, default=2)  # Basic users start with 2 uses
    last_usage_reset = Column(DateTime, default=datetime.utcnow)  # Track monthly reset
    paddle_customer_id = Column(String, nullable=True, index=True)  # Paddle customer ID
    subscription_tier = Column(String, default="free")  # free, pro, premium
    subscription_status = Column(String, default="inactive")  # active, cancelled, past_due, etc.
    is_paying = Column(Boolean, default=True)  # False for manually granted Pro users (non-paying)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    subscriptions = relationship("Subscription", back_populates="user")
    # history = relationship("DocumentHistory", back_populates="user")
