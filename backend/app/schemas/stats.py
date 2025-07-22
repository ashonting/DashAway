from pydantic import BaseModel

class GlobalStatsBase(BaseModel):
    total_texts_cleaned: int
    total_em_dashes_found: int
    total_cliches_found: int
    total_jargon_found: int
    total_ai_tells_found: int
    total_documents_processed: int

class GlobalStats(GlobalStatsBase):
    id: int

    class Config:
        from_attributes = True
