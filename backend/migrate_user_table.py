#!/usr/bin/env python3
"""
Add usage_count and last_usage_reset columns to existing users table.
"""

import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env')

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("DATABASE_URL environment variable is not set")
    sys.exit(1)

# Create database connection
engine = create_engine(DATABASE_URL)

def migrate_users_table():
    """Add missing columns to users table."""
    with engine.connect() as conn:
        try:
            # Check if columns already exist
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'users' 
                AND column_name IN ('usage_count', 'last_usage_reset')
            """))
            
            existing_columns = [row[0] for row in result.fetchall()]
            
            # Add usage_count if it doesn't exist
            if 'usage_count' not in existing_columns:
                print("Adding usage_count column...")
                conn.execute(text("""
                    ALTER TABLE users 
                    ADD COLUMN usage_count INTEGER DEFAULT 2
                """))
                print("✓ Added usage_count column")
            else:
                print("✓ usage_count column already exists")
            
            # Add last_usage_reset if it doesn't exist  
            if 'last_usage_reset' not in existing_columns:
                print("Adding last_usage_reset column...")
                conn.execute(text("""
                    ALTER TABLE users 
                    ADD COLUMN last_usage_reset TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                """))
                print("✓ Added last_usage_reset column")
            else:
                print("✓ last_usage_reset column already exists")
                
            conn.commit()
            print("Database migration completed successfully!")
            
        except Exception as e:
            conn.rollback()
            print(f"Error during migration: {e}")
            raise

if __name__ == "__main__":
    migrate_users_table()