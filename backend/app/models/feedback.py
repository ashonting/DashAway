from sqlalchemy import Column, Integer, String, Text
from ..database import Base

class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)
    feedback_type = Column(String, index=True)
    content = Column(Text, nullable=False)
