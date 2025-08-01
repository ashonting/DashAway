#!/bin/bash

# DashAway Production Deployment Script - Optimized for 1GB Droplet
set -e

echo "🚀 Starting DashAway deployment for 1GB droplet..."

# Configuration
DOMAIN="dashaway.io"
EMAIL="support@dashaway.io"  # Replace with your actual email

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() { echo -e "${GREEN}[INFO]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

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

# Optimize system for 1GB memory
print_status "Optimizing system for 1GB memory..."

# Add swap if it doesn't exist
if ! swapon --show | grep -q "/swapfile"; then
    print_status "Creating 1GB swap file..."
    fallocate -l 1G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# Optimize kernel parameters for low memory
cat >> /etc/sysctl.conf << EOF
# Memory optimization for 1GB droplet
vm.swappiness=10
vm.vfs_cache_pressure=50
vm.overcommit_memory=1
net.core.somaxconn=1024
EOF
sysctl -p

print_status "Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true

# Clean up Docker to free memory
print_status "Cleaning up Docker resources..."
docker system prune -f --volumes 2>/dev/null || true

print_status "Building application (this may take a while on 1GB)..."
# Build one service at a time to avoid memory issues
docker-compose -f docker-compose.prod.yml build --no-cache backend
docker-compose -f docker-compose.prod.yml build --no-cache frontend

print_status "Starting application..."
docker-compose -f docker-compose.prod.yml up -d

print_status "Waiting for services to be ready (extended timeout for 1GB)..."
sleep 60

# Check if containers are running
RETRIES=0
MAX_RETRIES=5
while [ $RETRIES -lt $MAX_RETRIES ]; do
    if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
        break
    fi
    RETRIES=$((RETRIES + 1))
    print_warning "Services not ready yet, waiting... (attempt $RETRIES/$MAX_RETRIES)"
    sleep 30
done

if [ $RETRIES -eq $MAX_RETRIES ]; then
    print_error "Services failed to start. Check logs:"
    docker-compose -f docker-compose.prod.yml logs
    exit 1
fi

print_status "Setting up Nginx configuration..."
# Backup existing nginx config
if [ -f "/etc/nginx/sites-enabled/default" ]; then
    cp /etc/nginx/sites-enabled/default /etc/nginx/sites-enabled/default.backup.$(date +%Y%m%d_%H%M%S)
fi

# Copy optimized nginx config for 1GB droplet
cat > /etc/nginx/sites-available/dashaway << 'EOF'
# Nginx configuration optimized for 1GB droplet
worker_processes 1;
worker_connections 512;

server {
    listen 80;
    server_name dashaway.io www.dashaway.io;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name dashaway.io www.dashaway.io;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/dashaway.io/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dashaway.io/privkey.pem;
    
    # Optimized SSL for 1GB
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Optimized compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 4;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Reduced buffer sizes for 1GB
    client_max_body_size 5M;
    client_body_buffer_size 16k;
    client_header_buffer_size 1k;

    # API Routes
    location /api/ {
        proxy_pass http://127.0.0.1:8000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    # Docs
    location /docs {
        proxy_pass http://127.0.0.1:8000/docs;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Frontend
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

ln -sf /etc/nginx/sites-available/dashaway /etc/nginx/sites-enabled/default

# Test nginx configuration
if ! nginx -t; then
    print_error "Nginx configuration test failed!"
    exit 1
fi

print_status "Restarting Nginx..."
systemctl restart nginx

print_status "Setting up SSL certificate..."
systemctl stop nginx

# Get SSL certificate
if ! certbot certonly --standalone -d $DOMAIN -d www.$DOMAIN --email $EMAIL --agree-tos --non-interactive; then
    print_error "SSL certificate generation failed!"
    systemctl start nginx
    exit 1
fi

systemctl start nginx

# Auto-renewal
crontab -l 2>/dev/null | { cat; echo "0 12 * * * /usr/bin/certbot renew --quiet"; } | crontab -

print_status "Setting up systemd service..."
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
TimeoutStartSec=300
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable dashaway

# Monitor script for 1GB droplet
cat > /usr/local/bin/dashaway-monitor << 'EOF'
#!/bin/bash
# Monitor script for 1GB droplet

MEMORY_THRESHOLD=85
SWAP_THRESHOLD=50

# Check memory usage
MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
SWAP_USAGE=$(free | grep Swap | awk '{if ($2 > 0) printf "%.0f", $3/$2 * 100.0; else print 0}')

if [ "$MEMORY_USAGE" -gt "$MEMORY_THRESHOLD" ] || [ "$SWAP_USAGE" -gt "$SWAP_THRESHOLD" ]; then
    echo "$(date): High memory usage detected (RAM: ${MEMORY_USAGE}%, SWAP: ${SWAP_USAGE}%)" >> /var/log/dashaway-monitor.log
    # Restart containers if memory is critically high
    if [ "$MEMORY_USAGE" -gt "95" ]; then
        docker-compose -f /var/www/dashaway/docker-compose.prod.yml restart
    fi
fi
EOF

chmod +x /usr/local/bin/dashaway-monitor
# Run monitor every 5 minutes
crontab -l 2>/dev/null | { cat; echo "*/5 * * * * /usr/local/bin/dashaway-monitor"; } | crontab -

print_status "Deployment completed successfully! 🎉"
print_status "Your application should be available at: https://$DOMAIN"
print_status ""
print_warning "1GB Droplet Optimization Notes:"
print_status "- Swap file added for memory relief"
print_status "- Container memory limits set (Backend: 256MB, Frontend: 512MB)"
print_status "- Monitoring script installed for memory management"
print_status "- Extended timeouts for slower 1GB performance"
print_status ""
print_status "Useful commands:"
print_status "- Monitor memory: free -h"
print_status "- View logs: docker-compose -f docker-compose.prod.yml logs -f"
print_status "- Restart app: systemctl restart dashaway"
print_status "- Monitor script: tail -f /var/log/dashaway-monitor.log"
EOF