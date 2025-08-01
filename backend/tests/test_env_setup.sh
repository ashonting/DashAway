#!/bin/bash

# Test environment setup script
# This script sets up environment variables needed for testing

export TESTING=true
export DATABASE_URL="sqlite:///./test.db"
export JWT_SECRET="test-jwt-secret-key-for-testing"
export SUPABASE_JWT_SECRET="test-supabase-jwt-secret"
export NEXT_PUBLIC_SUPABASE_URL="https://test.supabase.co"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="test-anon-key"
export CORS_ORIGINS="http://localhost:3000"

# Run the command passed as arguments
exec "$@"