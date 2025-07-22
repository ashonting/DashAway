from sqlalchemy import Column, Integer, String, Text
from ..database import Base

class FAQ(Base):
    __tablename__ = "faq"

    id = Column(Integer, primary_key=True, index=True)
    question = Column(String, index=True)
    answer = Column(Text, nullable=False)
