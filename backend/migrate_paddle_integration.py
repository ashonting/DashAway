#!/usr/bin/env python3
"""
Database migration script for Paddle integration
Run this to update your database schema with new Paddle-related columns
"""

import os
import sys
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.database import Base, engine
from app.models.user import User
from app.models.subscription import Subscription

def run_migration():
    """Run the database migration"""
    print("🚀 Starting Paddle integration database migration...")
    
    try:
        # Create all tables (this will add new columns to existing tables)
        print("📋 Creating/updating database tables...")
        Base.metadata.create_all(bind=engine)
        
        # Create session
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        
        try:
            # Update existing users with default values for new columns
            print("👥 Updating existing users with default values...")
            
            # Check if paddle_customer_id column exists and add it if not
            result = db.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='users' AND column_name='paddle_customer_id'
            """))
            
            if not result.fetchone():
                print("Adding paddle_customer_id column to users table...")
                db.execute(text("ALTER TABLE users ADD COLUMN paddle_customer_id VARCHAR"))
                db.execute(text("CREATE INDEX ix_users_paddle_customer_id ON users (paddle_customer_id)"))
            
            # Check and add subscription_tier column
            result = db.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='users' AND column_name='subscription_tier'
            """))
            
            if not result.fetchone():
                print("Adding subscription_tier column to users table...")
                db.execute(text("ALTER TABLE users ADD COLUMN subscription_tier VARCHAR DEFAULT 'free'"))
            
            # Check and add subscription_status column
            result = db.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='users' AND column_name='subscription_status'
            """))
            
            if not result.fetchone():
                print("Adding subscription_status column to users table...")
                db.execute(text("ALTER TABLE users ADD COLUMN subscription_status VARCHAR DEFAULT 'inactive'"))
            
            # Check and add created_at column
            result = db.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='users' AND column_name='created_at'
            """))
            
            if not result.fetchone():
                print("Adding created_at column to users table...")
                db.execute(text("ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"))
            
            # Check and add updated_at column
            result = db.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='users' AND column_name='updated_at'
            """))
            
            if not result.fetchone():
                print("Adding updated_at column to users table...")
                db.execute(text("ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"))
            
            # Update existing users to have default values
            db.execute(text("""
                UPDATE users 
                SET subscription_tier = 'free', 
                    subscription_status = 'inactive',
                    created_at = CURRENT_TIMESTAMP,
                    updated_at = CURRENT_TIMESTAMP
                WHERE subscription_tier IS NULL OR subscription_status IS NULL
            """))
            
            db.commit()
            print("✅ User table migration completed successfully!")
            
        except Exception as e:
            print(f"❌ Error during migration: {str(e)}")
            db.rollback()
            raise
        finally:
            db.close()
            
        print("🎉 Database migration completed successfully!")
        print("\n📝 Next steps:")
        print("1. Set up your Paddle environment variables:")
        print("   - PADDLE_API_KEY")
        print("   - PADDLE_WEBHOOK_SECRET")
        print("   - PADDLE_VENDOR_ID")
        print("   - PADDLE_PRO_MONTHLY_PRICE_ID")
        print("   - PADDLE_PRO_YEARLY_PRICE_ID")
        print("   - PADDLE_PRO_PRODUCT_ID")
        print("   - PADDLE_PREMIUM_MONTHLY_PRICE_ID")
        print("   - PADDLE_PREMIUM_YEARLY_PRICE_ID")
        print("   - PADDLE_PREMIUM_PRODUCT_ID")
        print("2. Test the integration in Paddle Sandbox")
        print("3. Configure your webhook endpoint at: https://dashaway.io/api/paddle/webhook")
        
    except Exception as e:
        print(f"❌ Migration failed: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    run_migration()