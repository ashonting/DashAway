#!/bin/bash

# Script to update SUPABASE_SERVICE_ROLE_KEY on the server
echo "Updating Supabase service role key..."

# Update the .env file
sed -i 's/SUPABASE_SERVICE_ROLE_KEY=YOUR_NEW_SERVICE_ROLE_KEY_HERE/SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzanhub2Jqa2tlc3lzemhwd2V1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA2ODg4OCwiZXhwIjoyMDY5NjQ0ODg4fQ.x0S64EgKf2Iz30dGa0chfd5AplS1z7RS1Dcn9WLOgAQ/' /root/dashaway/.env

echo "Environment variable updated!"

# Restart Docker containers to apply changes
echo "Restarting Docker containers..."
cd /root/dashaway
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d

echo "Containers restarted! Authentication should now work."
echo "Please test: https://dashaway.io/login"