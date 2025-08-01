from sqlalchemy import Column, Integer, String, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base
from datetime import datetime

class DocumentHistory(Base):
    __tablename__ = "document_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    original_text = Column(Text, nullable=False)
    cleaned_text = Column(Text, nullable=False)
    created_at = Column(String, default=lambda: datetime.utcnow().isoformat())

    # user = relationship("User", back_populates="history")
