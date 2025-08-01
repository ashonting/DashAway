#!/bin/bash

# File comparison script for local vs server
SERVER="root@209.97.145.242"
SERVER_PATH="/var/www/DashAway"
LOCAL_PATH="/home/adam/dashaway"

echo "=== DASHAWAY LOCAL VS SERVER FILE COMPARISON ==="
echo "Local: $LOCAL_PATH"
echo "Server: $SERVER_PATH"
echo ""

# Key files to compare
KEY_FILES=(
    "docker-compose.prod.yml"
    "backend/app/routes/analysis.py"
    "backend/app/routes/auth.py"
    "backend/app/routes/users.py" 
    "backend/app/routes/paddle.py"
    "backend/app/routes/history.py"
    "backend/app/services/segmenter.py"
    "backend/app/services/paddle_service.py"
    "backend/app/models/user.py"
    "backend/app/models/subscription.py"
    "backend/app/models/history.py"
    "backend/requirements.txt"
    "frontend/package.json"
    "frontend/next.config.mjs"
    "frontend/src/hooks/useTextAnalysis.ts"
)

echo "=== COMPARING KEY FILES ==="
for file in "${KEY_FILES[@]}"; do
    echo -n "Checking $file... "
    
    if [[ ! -f "$LOCAL_PATH/$file" ]]; then
        echo "MISSING LOCAL"
        continue
    fi
    
    # Get local hash
    LOCAL_HASH=$(md5sum "$LOCAL_PATH/$file" | cut -d' ' -f1)
    
    # Get server hash
    SERVER_HASH=$(ssh $SERVER "cd $SERVER_PATH && md5sum $file 2>/dev/null" | cut -d' ' -f1)
    
    if [[ -z "$SERVER_HASH" ]]; then
        echo "MISSING SERVER"
    elif [[ "$LOCAL_HASH" == "$SERVER_HASH" ]]; then
        echo "IDENTICAL"
    else
        echo "DIFFERENT"
        echo "  Local:  $LOCAL_HASH"
        echo "  Server: $SERVER_HASH"
    fi
done

echo ""
echo "=== CHECKING FOR SERVER-ONLY FILES ==="
ssh $SERVER "cd $SERVER_PATH && find . -name '*.py' -path './backend/app/*' -newer './backend/app/__init__.py' 2>/dev/null" | while read server_file; do
    local_file="$LOCAL_PATH/${server_file#./}"
    if [[ ! -f "$local_file" ]]; then
        echo "SERVER-ONLY: $server_file"
    fi
done

echo ""
echo "=== CHECKING FOR LOCAL-ONLY FILES ==="
find "$LOCAL_PATH/backend/app" -name '*.py' -newer "$LOCAL_PATH/backend/app/__init__.py" 2>/dev/null | while read local_file; do
    server_file="${local_file#$LOCAL_PATH/}"
    server_exists=$(ssh $SERVER "cd $SERVER_PATH && test -f $server_file && echo 'exists' || echo 'missing'")
    if [[ "$server_exists" == "missing" ]]; then
        echo "LOCAL-ONLY: $server_file"
    fi
done

echo ""
echo "=== ENVIRONMENT FILE COMPARISON ==="
echo "Local .env.production vs Server .env:"
if [[ -f "$LOCAL_PATH/.env.production" ]]; then
    LOCAL_ENV_HASH=$(md5sum "$LOCAL_PATH/.env.production" | cut -d' ' -f1)
    SERVER_ENV_HASH=$(ssh $SERVER "cd $SERVER_PATH && md5sum .env 2>/dev/null" | cut -d' ' -f1)
    
    if [[ "$LOCAL_ENV_HASH" == "$SERVER_ENV_HASH" ]]; then
        echo "Environment files are IDENTICAL"
    else
        echo "Environment files are DIFFERENT"
        echo "  Local .env.production:  $LOCAL_ENV_HASH"
        echo "  Server .env:           $SERVER_ENV_HASH"
    fi
else
    echo "Local .env.production file missing"
fi

echo ""
echo "=== CONTAINER STATUS ==="
echo "Local containers:"
docker-compose ps 2>/dev/null || echo "No local containers running"

echo ""
echo "Server containers:"
ssh $SERVER "cd $SERVER_PATH && docker-compose ps"

echo ""
echo "=== SUMMARY ==="
echo "Analysis complete. Check output above for any differences."