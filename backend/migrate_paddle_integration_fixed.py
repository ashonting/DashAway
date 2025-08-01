#\!/usr/bin/env python3
"""
Fixed database migration script for Paddle integration
"""

import os
import sys
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

try:
    from app.database import engine
    from sqlalchemy import text, inspect
    from sqlalchemy.orm import sessionmaker
    print("✅ Successfully imported required modules")
except ImportError as e:
    print(f"❌ Import error: {e}")
    sys.exit(1)

def run_migration():
    """Run the database migration"""
    print("🚀 Starting Paddle integration database migration...")
    
    try:
        # Create session
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        
        try:
            # Check what columns exist
            inspector = inspect(engine)
            existing_columns = [col["name"] for col in inspector.get_columns("users")]
            print(f"📋 Existing user columns: {existing_columns}")
            
            # Add missing columns one by one
            columns_to_add = [
                ("paddle_customer_id", "VARCHAR"),
                ("subscription_tier", "VARCHAR DEFAULT 'free'"),
                ("subscription_status", "VARCHAR DEFAULT 'inactive'"),
                ("created_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"),
                ("updated_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
            ]
            
            for column_name, column_def in columns_to_add:
                if column_name not in existing_columns:
                    print(f"➕ Adding column: {column_name}")
                    try:
                        db.execute(text(f"ALTER TABLE users ADD COLUMN {column_name} {column_def}"))
                        db.commit()
                        print(f"✅ Added {column_name}")
                    except Exception as e:
                        print(f"⚠️  Error adding {column_name}: {e}")
                        db.rollback()
                else:
                    print(f"✅ Column {column_name} already exists")
            
            print("🎉 Database migration completed successfully\!")
            
        except Exception as e:
            print(f"❌ Error during migration: {str(e)}")
            db.rollback()
            raise
        finally:
            db.close()
            
    except Exception as e:
        print(f"❌ Migration failed: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    run_migration()
