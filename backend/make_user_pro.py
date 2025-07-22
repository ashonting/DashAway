#!/usr/bin/env python3
"""
Make a user account Pro by adding an active subscription.
"""

import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Add the app directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.models.user import User
from app.models.subscription import Subscription
from app.database import Base

# Load environment variables
load_dotenv('.env')

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("DATABASE_URL environment variable is not set")
    sys.exit(1)

# Create database connection
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def make_user_pro(user_email: str):
    """Make a user account Pro by adding an active subscription."""
    db = SessionLocal()
    try:
        # Find the user
        user = db.query(User).filter(User.email == user_email).first()
        if not user:
            print(f"User with email '{user_email}' not found")
            return False
        
        # Check if user already has an active subscription
        existing_sub = db.query(Subscription).filter(
            Subscription.user_id == user.id,
            Subscription.status == 'active'
        ).first()
        
        if existing_sub:
            print(f"User '{user_email}' already has an active Pro subscription")
            return True
        
        # Create a Pro subscription
        subscription = Subscription(
            user_id=user.id,
            paddle_subscription_id=f"manual_pro_{user.id}",
            status="active"
        )
        
        db.add(subscription)
        db.commit()
        
        print(f"✓ Successfully made user '{user_email}' a Pro member!")
        print(f"  User ID: {user.id}")
        print(f"  Subscription ID: manual_pro_{user.id}")
        print(f"  Status: active")
        
        return True
        
    except Exception as e:
        db.rollback()
        print(f"Error making user Pro: {e}")
        return False
    finally:
        db.close()

def list_all_users():
    """List all users in the system."""
    db = SessionLocal()
    try:
        users = db.query(User).all()
        print("All users in the system:")
        print("-" * 50)
        for user in users:
            subscriptions = db.query(Subscription).filter(
                Subscription.user_id == user.id,
                Subscription.status == 'active'
            ).all()
            
            status = "Pro" if subscriptions else "Basic"
            print(f"ID: {user.id} | Email: {user.email} | Status: {status} | Uses: {user.usage_count}")
            
    except Exception as e:
        print(f"Error listing users: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python make_user_pro.py <email>           # Make user Pro")
        print("  python make_user_pro.py --list           # List all users")
        sys.exit(1)
    
    if sys.argv[1] == "--list":
        list_all_users()
    else:
        email = sys.argv[1]
        make_user_pro(email)