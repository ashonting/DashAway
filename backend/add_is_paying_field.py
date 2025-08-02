#!/usr/bin/env python3
"""
Migration script to add is_paying field to users table
"""

import os
import sys
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    """Get database connection from environment variables."""
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        print("ERROR: DATABASE_URL environment variable not set")
        sys.exit(1)
    
    try:
        conn = psycopg2.connect(database_url)
        return conn
    except Exception as e:
        print(f"ERROR: Could not connect to database: {e}")
        sys.exit(1)

def add_is_paying_field():
    """Add is_paying field to users table."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Check if column already exists
        cursor.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='users' AND column_name='is_paying';
        """)
        
        if cursor.fetchone():
            print("Column 'is_paying' already exists in users table")
            return
        
        # Add the new column
        cursor.execute("""
            ALTER TABLE users 
            ADD COLUMN is_paying BOOLEAN DEFAULT TRUE;
        """)
        
        # Set existing Pro users without active subscriptions as non-paying
        cursor.execute("""
            UPDATE users 
            SET is_paying = FALSE 
            WHERE subscription_tier = 'pro' 
            AND subscription_status != 'active';
        """)
        
        # Commit the changes
        conn.commit()
        print("Successfully added 'is_paying' field to users table")
        
        # Show updated stats
        cursor.execute("""
            SELECT 
                subscription_tier,
                is_paying,
                COUNT(*) as count
            FROM users 
            GROUP BY subscription_tier, is_paying 
            ORDER BY subscription_tier, is_paying;
        """)
        
        results = cursor.fetchall()
        print("\nUpdated user distribution:")
        for row in results:
            tier, paying, count = row
            status = "paying" if paying else "non-paying"
            print(f"  {tier} ({status}): {count} users")
            
    except Exception as e:
        conn.rollback()
        print(f"ERROR: Migration failed: {e}")
        sys.exit(1)
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    add_is_paying_field()