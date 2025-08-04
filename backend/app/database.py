import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv("/app/.env")

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

engine = create_engine(
    DATABASE_URL,
    # Connection pool settings optimized for production
    pool_size=2,            # Reduced for Supabase connection limits
    max_overflow=3,         # Minimal overflow for Supabase (total max: 5)
    pool_pre_ping=True,     # Verify connections before use
    pool_recycle=3600,      # Recycle connections every hour
    pool_timeout=30,        # Timeout when getting connection from pool
    # Performance optimizations
    echo=False,             # Disable SQL logging in production
    future=True,            # Use SQLAlchemy 2.0 style
    # Connection arguments for PostgreSQL optimization
    connect_args={
        "options": "-c default_transaction_isolation=read_committed"
    }
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
