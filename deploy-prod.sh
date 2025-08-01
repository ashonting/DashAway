#!/bin/bash

# DashAway Production Deployment Script
# Run this script from the production server after pulling latest code
set -e

echo "🚀 Starting DashAway production deployment..."

# Configuration
DEPLOY_DIR="/var/www/DashAway"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if running in correct directory
if [ ! -f "docker-compose.prod.yml" ]; then
    print_error "docker-compose.prod.yml not found! Please run this script from the project root directory."
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_error ".env file not found! Please create it first."
    exit 1
fi

print_step "1/6 Stopping and removing existing containers..."
docker-compose -f docker-compose.prod.yml down --remove-orphans

print_step "2/6 Pruning Docker system (removing unused images, containers, networks)..."
docker system prune -f

print_step "3/6 Removing .env.local from frontend (production should use .env only)..."
if [ -f "frontend/.env.local" ]; then
    print_warning "Removing frontend/.env.local (should not be used in production)"
    rm -f frontend/.env.local
fi

print_step "4/6 Building containers with no cache..."
docker-compose -f docker-compose.prod.yml build --no-cache --parallel

print_step "5/6 Starting containers in detached mode..."
docker-compose -f docker-compose.prod.yml up -d

print_step "6/6 Waiting for services to be ready..."
sleep 15

print_status "Checking container status..."
docker-compose -f docker-compose.prod.yml ps

# Check if containers are running
FRONTEND_STATUS=$(docker-compose -f docker-compose.prod.yml ps -q frontend | xargs docker inspect -f '{{.State.Status}}' 2>/dev/null || echo "not_found")
BACKEND_STATUS=$(docker-compose -f docker-compose.prod.yml ps -q backend | xargs docker inspect -f '{{.State.Status}}' 2>/dev/null || echo "not_found")

if [ "$FRONTEND_STATUS" != "running" ] || [ "$BACKEND_STATUS" != "running" ]; then
    print_error "Some containers failed to start properly!"
    print_error "Frontend status: $FRONTEND_STATUS"
    print_error "Backend status: $BACKEND_STATUS"
    echo ""
    print_error "Container logs:"
    docker-compose -f docker-compose.prod.yml logs --tail=20
    exit 1
fi

print_status "✅ Deployment completed successfully!"
print_status ""
print_status "🌐 Application should be available at: https://dashaway.io"
print_status ""
print_status "📊 Container Status:"
docker-compose -f docker-compose.prod.yml ps
print_status ""
print_status "📝 Useful commands:"
print_status "  • View logs: docker-compose -f docker-compose.prod.yml logs -f"  
print_status "  • Restart specific service: docker-compose -f docker-compose.prod.yml restart [frontend|backend]"
print_status "  • Check health: docker-compose -f docker-compose.prod.yml ps"
print_status "  • Stop all: docker-compose -f docker-compose.prod.yml down"
print_status ""
print_status "🔍 To verify deployment, check:"
print_status "  • curl -I https://dashaway.io (should return 200)"
print_status "  • curl https://dashaway.io/api/stats (should return API response)"

echo ""
print_status "🎉 Deployment complete! The new UI changes should now be live."