from pydantic import BaseModel

class FeedbackBase(BaseModel):
    feedback_type: str
    content: str

class FeedbackCreate(FeedbackBase):
    pass

class Feedback(FeedbackBase):
    id: int

    class Config:
        from_attributes = True