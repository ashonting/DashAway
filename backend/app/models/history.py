from sqlalchemy import Column, Integer, String, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base
from datetime import datetime

class DocumentHistory(Base):
    __tablename__ = "document_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    analysis_results = Column(JSON, nullable=False)
    created_at = Column(String, default=lambda: datetime.utcnow().isoformat())

    # user = relationship("User", back_populates="history")
