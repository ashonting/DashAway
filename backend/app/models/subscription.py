from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float, Boolean, Text
from sqlalchemy.orm import relationship
from ..database import Base
from datetime import datetime

class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    paddle_subscription_id = Column(String, unique=True, index=True, nullable=False)
    paddle_customer_id = Column(String, nullable=False, index=True)
    paddle_product_id = Column(String, nullable=False)
    paddle_price_id = Column(String, nullable=False)
    status = Column(String, nullable=False)  # active, cancelled, past_due, paused, etc.
    tier = Column(String, nullable=False)  # pro, premium
    billing_cycle = Column(String, nullable=False)  # monthly, yearly
    quantity = Column(Integer, default=1)
    unit_price = Column(Float, nullable=False)  # Price per unit
    currency = Column(String, default="USD")
    current_period_start = Column(DateTime, nullable=True)
    current_period_end = Column(DateTime, nullable=True)
    cancel_at_period_end = Column(Boolean, default=False)
    cancelled_at = Column(DateTime, nullable=True)
    ended_at = Column(DateTime, nullable=True)
    trial_start = Column(DateTime, nullable=True)
    trial_end = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Store full Paddle webhook data for debugging
    paddle_data = Column(Text, nullable=True)  # JSON string of full Paddle data

    user = relationship("User", back_populates="subscriptions")
