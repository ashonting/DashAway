from sqlalchemy import Column, Integer
from ..database import Base

class GlobalStats(Base):
    __tablename__ = "global_stats"

    id = Column(Integer, primary_key=True, index=True)
    total_texts_cleaned = Column(Integer, default=0)
    total_em_dashes_found = Column(Integer, default=0)
    total_cliches_found = Column(Integer, default=0)
    total_jargon_found = Column(Integer, default=0)
    total_ai_tells_found = Column(Integer, default=0)
    total_documents_processed = Column(Integer, default=0)
