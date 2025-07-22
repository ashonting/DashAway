#!/bin/bash

# DashAway Production Deployment Script
set -e

echo "🚀 Starting DashAway deployment..."

# Configuration
DOMAIN="dashaway.io"
EMAIL="support@dashaway.io"  # Replace with your actual email for SSL

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run as root (use sudo)"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_error ".env file not found! Please create it first."
    exit 1
fi

print_status "Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true

print_status "Building and starting application..."
docker-compose -f docker-compose.prod.yml up --build -d

print_status "Waiting for services to be ready..."
sleep 30

# Check if containers are running
if ! docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    print_error "Containers failed to start. Check logs:"
    docker-compose -f docker-compose.prod.yml logs
    exit 1
fi

print_status "Setting up Nginx configuration..."
# Backup existing nginx config if it exists
if [ -f "/etc/nginx/sites-enabled/default" ]; then
    cp /etc/nginx/sites-enabled/default /etc/nginx/sites-enabled/default.backup.$(date +%Y%m%d_%H%M%S)
fi

# Copy our nginx config
cp nginx.conf /etc/nginx/sites-available/dashaway
ln -sf /etc/nginx/sites-available/dashaway /etc/nginx/sites-enabled/default

# Test nginx configuration
print_status "Testing Nginx configuration..."
if ! nginx -t; then
    print_error "Nginx configuration test failed!"
    exit 1
fi

print_status "Restarting Nginx..."
systemctl restart nginx

print_status "Setting up SSL certificate..."
# Stop nginx temporarily for certbot
systemctl stop nginx

# Get SSL certificate
certbot certonly --standalone -d $DOMAIN -d www.$DOMAIN --email $EMAIL --agree-tos --non-interactive

# Start nginx again
systemctl start nginx

# Enable auto-renewal
crontab -l 2>/dev/null | { cat; echo "0 12 * * * /usr/bin/certbot renew --quiet"; } | crontab -

print_status "Setting up log rotation..."
cat > /etc/logrotate.d/dashaway << EOF
/var/log/dashaway/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        docker-compose -f /var/www/dashaway/docker-compose.prod.yml restart
    endscript
}
EOF

print_status "Setting up systemd service for auto-restart..."
cat > /etc/systemd/system/dashaway.service << EOF
[Unit]
Description=DashAway Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/var/www/dashaway
ExecStart=/usr/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/bin/docker-compose -f docker-compose.prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable dashaway

print_status "Deployment completed successfully! 🎉"
print_status "Your application should be available at: https://$DOMAIN"
print_status ""
print_status "Next steps:"
print_status "1. Update your DNS records to point to this server"
print_status "2. Test your application"
print_status "3. Monitor logs: docker-compose -f docker-compose.prod.yml logs -f"
print_status ""
print_status "Useful commands:"
print_status "- View logs: docker-compose -f docker-compose.prod.yml logs -f"
print_status "- Restart app: systemctl restart dashaway"
print_status "- Update app: git pull && docker-compose -f docker-compose.prod.yml up --build -d"