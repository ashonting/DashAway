#!/usr/bin/env python3
import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

# Get the connection string
DATABASE_URL = os.getenv('DATABASE_URL')

if not DATABASE_URL:
    print("❌ No DATABASE_URL found in .env")
    exit(1)

print("Testing connection to Supabase...")
print(f"Host: {DATABASE_URL.split('@')[1].split('/')[0]}")

try:
    # Attempt connection
    conn = psycopg2.connect(DATABASE_URL)
    print("✅ Connection successful!")
    
    # Test a simple query
    cur = conn.cursor()
    cur.execute("SELECT version();")
    version = cur.fetchone()[0]
    print(f"✅ Database version: {version}")
    
    cur.close()
    conn.close()
    
except psycopg2.OperationalError as e:
    if "Wrong password" in str(e):
        print("❌ Wrong password - check your Supabase dashboard for correct credentials")
    elif "timeout" in str(e).lower():
        print("❌ Connection timeout - network or firewall issue")
    else:
        print(f"❌ Connection error: {e}")
        
except Exception as e:
    print(f"❌ Unexpected error: {e}")