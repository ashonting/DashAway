#!/bin/bash

# DashAway Paddle Integration Deployment Script
set -e

SERVER_IP="209.97.145.242"
SERVER_USER="root"
SERVER_PATH="/var/www/DashAway"

echo "🚀 Starting Paddle integration deployment to $SERVER_IP..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() { echo -e "${GREEN}[INFO]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check if server is reachable
print_status "Checking server connectivity..."
if ! ping -c 1 $SERVER_IP > /dev/null 2>&1; then
    print_error "Cannot reach server $SERVER_IP"
    exit 1
fi

# Create deployment directory
DEPLOY_DIR="paddle_deployment_$(date +%Y%m%d_%H%M%S)"
mkdir -p $DEPLOY_DIR

print_status "Preparing deployment files..."

# Copy backend files
mkdir -p $DEPLOY_DIR/backend/app/{services,schemas,routes,models}
cp backend/requirements.txt $DEPLOY_DIR/backend/
cp backend/app/services/paddle_service.py $DEPLOY_DIR/backend/app/services/
cp backend/app/schemas/paddle.py $DEPLOY_DIR/backend/app/schemas/
cp backend/app/routes/paddle.py $DEPLOY_DIR/backend/app/routes/
cp backend/app/models/user.py $DEPLOY_DIR/backend/app/models/
cp backend/app/models/subscription.py $DEPLOY_DIR/backend/app/models/
cp backend/migrate_paddle_integration_fixed.py $DEPLOY_DIR/backend/

# Copy frontend files
mkdir -p $DEPLOY_DIR/frontend/src/{services,hooks,app/pricing}
cp frontend/src/services/paddleService.ts $DEPLOY_DIR/frontend/src/services/
cp frontend/src/hooks/useSubscription.ts $DEPLOY_DIR/frontend/src/hooks/
cp frontend/src/app/pricing/page.tsx $DEPLOY_DIR/frontend/src/app/pricing/

# Copy documentation and environment files
cp PADDLE_INTEGRATION_GUIDE.md $DEPLOY_DIR/
cp PRODUCTION-ENV-FILES.md $DEPLOY_DIR/
cp .env $DEPLOY_DIR/.env.production

print_status "Uploading files to server..."

# Upload deployment directory
scp -r $DEPLOY_DIR/ $SERVER_USER@$SERVER_IP:/tmp/

print_status "Deploying files on server..."

# Execute deployment on server
ssh $SERVER_USER@$SERVER_IP << 'EOF'
set -e

DEPLOY_DIR="/tmp/$(ls /tmp | grep paddle_deployment | tail -1)"
SERVER_PATH="/var/www/DashAway"

echo "📁 Copying files to application directory..."

# Backup existing files
cd $SERVER_PATH
if [ -f "backend/requirements.txt" ]; then
    echo "Creating backup of existing files..."
    cp -r backend backend_backup_$(date +%Y%m%d_%H%M%S) || true
    cp -r frontend frontend_backup_$(date +%Y%m%d_%H%M%S) || true
fi

# Copy new files
echo "Creating backend directories if they don't exist..."
mkdir -p backend/app/services
mkdir -p backend/app/schemas
mkdir -p backend/app/routes
mkdir -p backend/app/models

echo "Copying backend files..."
cp $DEPLOY_DIR/backend/requirements.txt backend/
cp $DEPLOY_DIR/backend/app/services/paddle_service.py backend/app/services/
cp $DEPLOY_DIR/backend/app/schemas/paddle.py backend/app/schemas/
cp $DEPLOY_DIR/backend/app/routes/paddle.py backend/app/routes/
cp $DEPLOY_DIR/backend/app/models/user.py backend/app/models/
cp $DEPLOY_DIR/backend/app/models/subscription.py backend/app/models/
cp $DEPLOY_DIR/backend/migrate_paddle_integration_fixed.py backend/

echo "Creating frontend directories if they don't exist..."
mkdir -p frontend/src/services
mkdir -p frontend/src/hooks
mkdir -p frontend/src/app/pricing

echo "Copying frontend files..."
cp $DEPLOY_DIR/frontend/src/services/paddleService.ts frontend/src/services/
cp $DEPLOY_DIR/frontend/src/hooks/useSubscription.ts frontend/src/hooks/
cp $DEPLOY_DIR/frontend/src/app/pricing/page.tsx frontend/src/app/pricing/

echo "Copying documentation..."
cp $DEPLOY_DIR/PADDLE_INTEGRATION_GUIDE.md .
cp $DEPLOY_DIR/PRODUCTION-ENV-FILES.md .

echo "🔧 Setting up production environment variables..."
# Update .env file with production settings
cp $DEPLOY_DIR/.env.production .env

# Also create backend-specific env if needed
if [ ! -f "backend/.env" ]; then
    cp .env backend/.env
fi

# Update URLs for production in .env
sed -i 's|http://localhost:8000|https://dashaway.io/api|g' .env
sed -i 's|http://localhost:3000|https://dashaway.io|g' .env
sed -i 's|ENVIRONMENT=development|ENVIRONMENT=production|g' .env

echo "🔧 Running database migration..."
cd backend
python3 migrate_paddle_integration_fixed.py || {
    echo "Python3 not found, trying with docker..."
    cd ..
    docker-compose exec -T backend python migrate_paddle_integration_fixed.py
}

echo "🐳 Rebuilding and restarting containers..."
cd ..
docker-compose down
docker-compose up --build -d

echo "⏳ Waiting for containers to start..."
sleep 30

echo "✅ Deployment completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Configure your Paddle environment variables in .env files"
echo "2. Set up your Paddle products and webhook endpoints"
echo "3. Test the integration with Paddle Sandbox"
echo "4. Review the PADDLE_INTEGRATION_GUIDE.md for detailed setup"

# Clean up
rm -rf $DEPLOY_DIR
EOF

print_status "Cleaning up local deployment files..."
rm -rf $DEPLOY_DIR

print_status "✅ Paddle integration deployment completed successfully!"
print_warning "Don't forget to:"
print_warning "1. Configure Paddle environment variables on the server"
print_warning "2. Set up your Paddle webhook endpoint: https://dashaway.io/api/paddle/webhook"
print_warning "3. Test the integration thoroughly before going live"

echo ""
echo "📚 Check the PADDLE_INTEGRATION_GUIDE.md on your server for complete setup instructions."