from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, JSON
from ..database import Base
from datetime import datetime

class Error(Base):
    __tablename__ = "errors"

    id = Column(Integer, primary_key=True, index=True)
    # Error identification
    error_hash = Column(String(64), index=True)  # Hash for grouping similar errors
    error_type = Column(String(255), index=True)  # Exception class name
    error_message = Column(Text)  # Error message
    
    # Error details
    stack_trace = Column(Text)  # Full stack trace
    user_agent = Column(String(500))  # Browser/client info
    url = Column(String(500))  # URL where error occurred
    method = Column(String(10))  # HTTP method
    status_code = Column(Integer)  # HTTP status code
    
    # Context
    user_id = Column(Integer, nullable=True, index=True)  # User who experienced error
    user_email = Column(String(255), nullable=True)  # Denormalized for quick access
    ip_address = Column(String(45))  # Support IPv6
    
    # Additional data
    request_data = Column(JSON, nullable=True)  # Request payload (sanitized)
    headers = Column(JSON, nullable=True)  # Request headers (sanitized)
    metadata = Column(JSON, nullable=True)  # Any additional context
    
    # Error source
    source = Column(String(50), index=True)  # 'frontend' or 'backend'
    environment = Column(String(50))  # 'development', 'production', etc.
    
    # Status
    is_resolved = Column(Boolean, default=False, index=True)
    resolved_at = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)  # Admin notes
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Metrics (updated via triggers or background job)
    occurrence_count = Column(Integer, default=1)  # How many times this error occurred
    last_seen = Column(DateTime, default=datetime.utcnow)
    affected_users = Column(Integer, default=1)  # Number of unique users affected