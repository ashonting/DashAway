#!/usr/bin/env python3

import os
import sys
from sqlalchemy import create_engine, text, Column, Integer, String, DateTime, Boolean, Numeric, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

# Database connection
DATABASE_URL = "postgresql://dashaway_user:dashaway_password@db:5432/dashaway_db"

def main():
    print("Starting Paddle subscriptions table migration...")
    
    try:
        engine = create_engine(DATABASE_URL)
        
        # Add missing columns to subscriptions table
        columns_to_add = [
            "ADD COLUMN IF NOT EXISTS paddle_customer_id VARCHAR(255)",
            "ADD COLUMN IF NOT EXISTS paddle_product_id VARCHAR(255)",
            "ADD COLUMN IF NOT EXISTS paddle_price_id VARCHAR(255)",
            "ADD COLUMN IF NOT EXISTS tier VARCHAR(50) DEFAULT 'basic'",
            "ADD COLUMN IF NOT EXISTS billing_cycle VARCHAR(20) DEFAULT 'monthly'",
            "ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1",
            "ADD COLUMN IF NOT EXISTS unit_price NUMERIC(10,2)",
            "ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD'",
            "ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMP",
            "ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMP",
            "ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT FALSE",
            "ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP",
            "ADD COLUMN IF NOT EXISTS ended_at TIMESTAMP",
            "ADD COLUMN IF NOT EXISTS trial_start TIMESTAMP",
            "ADD COLUMN IF NOT EXISTS trial_end TIMESTAMP",
            "ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
            "ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
            "ADD COLUMN IF NOT EXISTS paddle_data JSON"
        ]
        
        with engine.connect() as conn:
            for column_def in columns_to_add:
                try:
                    sql = f"ALTER TABLE subscriptions {column_def}"
                    print(f"Executing: {sql}")
                    conn.execute(text(sql))
                    conn.commit()
                    print("✓ Success")
                except Exception as e:
                    print(f"⚠️  Warning (column may already exist): {e}")
        
        # Also add missing columns to users table for Paddle integration
        users_columns = [
            "ADD COLUMN IF NOT EXISTS paddle_customer_id VARCHAR(255)",
            "ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(50) DEFAULT 'basic'",
            "ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'none'",
            "ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP",
            "ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT FALSE",
            "ADD COLUMN IF NOT EXISTS usage_limit INTEGER DEFAULT 2",
            "ADD COLUMN IF NOT EXISTS billing_cycle VARCHAR(20) DEFAULT 'monthly'"
        ]
        
        with engine.connect() as conn:
            for column_def in users_columns:
                try:
                    sql = f"ALTER TABLE users {column_def}"
                    print(f"Executing: {sql}")
                    conn.execute(text(sql))
                    conn.commit()
                    print("✓ Success")
                except Exception as e:
                    print(f"⚠️  Warning (column may already exist): {e}")
        
        print("Migration completed successfully!")
        
    except Exception as e:
        print(f"Error during migration: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()