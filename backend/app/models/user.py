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

    # subscriptions = relationship("Subscription", back_populates="user")
    # history = relationship("DocumentHistory", back_populates="user")
