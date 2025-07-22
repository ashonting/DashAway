from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base

class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    paddle_subscription_id = Column(String, unique=True, index=True)
    status = Column(String)

    # user = relationship("User", back_populates="subscriptions")
