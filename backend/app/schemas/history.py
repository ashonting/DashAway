from pydantic import BaseModel
from typing import List, Dict

class DocumentHistoryBase(BaseModel):
    title: str
    content: str
    analysis_results: Dict

class DocumentHistoryCreate(DocumentHistoryBase):
    pass

class DocumentHistory(DocumentHistoryBase):
    id: int
    user_id: int
    created_at: str

    class Config:
        from_attributes = True
