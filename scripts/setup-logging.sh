#!/bin/bash

#############################################
# DashAway Logging Setup Script
# Sets up proper logging with rotation
#############################################

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] ✓${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] ⚠${NC} $1"
}

log_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ✗${NC} $1"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   log_error "This script must be run as root"
   exit 1
fi

log "🔧 Setting up DashAway logging system..."

#############################################
# 1. CREATE LOG DIRECTORIES
#############################################

log "📁 Creating log directory structure..."

LOG_DIRS=(
    "/var/log/dashaway"
    "/var/log/dashaway/backend"
    "/var/log/dashaway/frontend" 
    "/var/log/dashaway/nginx"
    "/var/log/dashaway/system"
)

for dir in "${LOG_DIRS[@]}"; do
    mkdir -p "$dir"
    chmod 755 "$dir"
done

log_success "Log directories created"

#############################################
# 2. SETUP DOCKER LOGGING CONFIGURATION
#############################################

log "🐳 Configuring Docker logging..."

# Create Docker daemon configuration for log rotation
cat > /etc/docker/daemon.json << 'EOF'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2"
}
EOF

log_success "Docker logging configured (10MB max size, 3 files)"

#############################################
# 3. SETUP LOGROTATE CONFIGURATION
#############################################

log "🔄 Setting up log rotation..."

# DashAway application logs
cat > /etc/logrotate.d/dashaway << 'EOF'
/var/log/dashaway/**/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    copytruncate
    create 644 root root
    postrotate
        # Send SIGUSR1 to applications if needed
        /bin/kill -USR1 $(cat /var/run/nginx.pid 2>/dev/null) 2>/dev/null || true
    endscript
}
EOF

# Nginx logs (more aggressive rotation due to high volume)
cat > /etc/logrotate.d/dashaway-nginx << 'EOF'
/var/log/nginx/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 www-data adm
    sharedscripts
    prerotate
        if [ -d /etc/logrotate.d/httpd-prerotate ]; then \
            run-parts /etc/logrotate.d/httpd-prerotate; \
        fi
    endscript
    postrotate
        invoke-rc.d nginx rotate >/dev/null 2>&1 || true
    endscript
}
EOF

# System logs for DashAway
cat > /etc/logrotate.d/dashaway-system << 'EOF'
/var/log/dashaway/system/*.log {
    weekly
    missingok
    rotate 4
    compress
    delaycompress
    notifempty
    copytruncate
    create 644 root root
}
EOF

log_success "Logrotate configurations created"

#############################################
# 4. SETUP SYSTEM LOG MONITORING
#############################################

log "📊 Setting up system log monitoring..."

# Create system monitoring script
cat > /usr/local/bin/dashaway-log-monitor << 'EOF'
#!/bin/bash

# DashAway System Log Monitor
# Tracks system metrics and logs issues

LOG_FILE="/var/log/dashaway/system/monitor.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Function to log with timestamp
log_metric() {
    echo "[$DATE] $1" >> "$LOG_FILE"
}

# Check memory usage
MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
log_metric "MEMORY_USAGE: ${MEMORY_USAGE}%"

# Check disk usage
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
log_metric "DISK_USAGE: ${DISK_USAGE}%"

# Check Docker container status
CONTAINERS_RUNNING=$(docker ps -q | wc -l)
CONTAINERS_TOTAL=$(docker ps -a -q | wc -l)
log_metric "CONTAINERS: ${CONTAINERS_RUNNING}/${CONTAINERS_TOTAL} running"

# Check for errors in application logs (last 5 minutes)
ERROR_COUNT=$(find /var/log/dashaway -name "*.log" -mmin -5 -exec grep -i "error\|exception\|failed" {} \; 2>/dev/null | wc -l)
log_metric "RECENT_ERRORS: ${ERROR_COUNT}"

# Alert on high usage
if (( $(echo "$MEMORY_USAGE > 90" | bc -l) )); then
    log_metric "ALERT: High memory usage: ${MEMORY_USAGE}%"
fi

if [[ $DISK_USAGE -gt 85 ]]; then
    log_metric "ALERT: High disk usage: ${DISK_USAGE}%"
fi

if [[ $ERROR_COUNT -gt 10 ]]; then
    log_metric "ALERT: High error rate: ${ERROR_COUNT} errors in last 5 minutes"
fi
EOF

chmod +x /usr/local/bin/dashaway-log-monitor

log_success "System log monitoring script created"

#############################################
# 5. SETUP CRON JOBS FOR MONITORING
#############################################

log "⏰ Setting up monitoring cron jobs..."

# Add monitoring cron job (every 5 minutes)
(crontab -l 2>/dev/null | grep -v dashaway-log-monitor; echo "*/5 * * * * /usr/local/bin/dashaway-log-monitor") | crontab -

# Add weekly log cleanup
(crontab -l 2>/dev/null | grep -v "find /var/log/dashaway"; echo "0 3 * * 0 find /var/log/dashaway -name '*.log' -mtime +30 -delete") | crontab -

log_success "Monitoring cron jobs configured"

#############################################
# 6. SETUP LOG FORWARDING SCRIPT
#############################################

log "📤 Setting up log aggregation..."

cat > /usr/local/bin/dashaway-log-aggregator << 'EOF'
#!/bin/bash

# DashAway Log Aggregator
# Collects and summarizes logs from all services

SUMMARY_LOG="/var/log/dashaway/system/daily-summary.log"
DATE=$(date '+%Y-%m-%d')

{
    echo "=== DashAway Daily Log Summary - $DATE ==="
    echo
    
    echo "=== System Metrics ==="
    tail -n 1 /var/log/dashaway/system/monitor.log 2>/dev/null || echo "No monitoring data"
    echo
    
    echo "=== Docker Container Status ==="
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Image}}" 2>/dev/null || echo "Docker not available"
    echo
    
    echo "=== Error Summary (Last 24 Hours) ==="
    find /var/log/dashaway -name "*.log" -mtime -1 -exec grep -i "error\|exception\|failed" {} \; 2>/dev/null | \
    awk '{print $1, $2, $3}' | sort | uniq -c | sort -nr | head -10 || echo "No errors found"
    echo
    
    echo "=== Top Log Sources ==="
    find /var/log/dashaway -name "*.log" -mtime -1 -exec wc -l {} + 2>/dev/null | \
    sort -nr | head -5 || echo "No log data"
    echo
    
    echo "=== Disk Usage ==="
    df -h / | tail -1
    echo
    
    echo "=== Memory Usage ==="
    free -h | grep -E "Mem|Swap"
    echo
    
} >> "$SUMMARY_LOG"

# Keep only last 30 days of summaries
find "$(dirname "$SUMMARY_LOG")" -name "daily-summary.log" -mtime +30 -delete 2>/dev/null
EOF

chmod +x /usr/local/bin/dashaway-log-aggregator

# Add daily log aggregation cron job
(crontab -l 2>/dev/null | grep -v dashaway-log-aggregator; echo "0 4 * * * /usr/local/bin/dashaway-log-aggregator") | crontab -

log_success "Log aggregation configured"

#############################################
# 7. RESTART DOCKER TO APPLY LOGGING CONFIG
#############################################

log "🔄 Restarting Docker to apply logging configuration..."

systemctl restart docker
sleep 5

log_success "Docker restarted with new logging configuration"

#############################################
# 8. VERIFICATION
#############################################

log "✅ Verifying logging setup..."

# Test logrotate configuration
logrotate -d /etc/logrotate.d/dashaway > /tmp/logrotate-test.log 2>&1
if [[ $? -eq 0 ]]; then
    log_success "Logrotate configuration valid"
else
    log_warning "Logrotate configuration may have issues - check /tmp/logrotate-test.log"
fi

# Test monitoring script
/usr/local/bin/dashaway-log-monitor
if [[ -f "/var/log/dashaway/system/monitor.log" ]]; then
    log_success "System monitoring working"
    tail -1 /var/log/dashaway/system/monitor.log
else
    log_warning "System monitoring may not be working properly"
fi

# Check cron jobs
if crontab -l | grep -q dashaway; then
    log_success "Cron jobs configured"
    crontab -l | grep dashaway
else
    log_warning "Cron jobs may not be configured properly"
fi

#############################################
# 9. SUMMARY
#############################################

echo
log "📋 Logging Setup Summary:"
echo "======================================"
echo "• Log directories: /var/log/dashaway/"
echo "• Docker logs: Limited to 10MB x 3 files per container"
echo "• Log rotation: Daily (7 days), weekly (4 weeks) retention"
echo "• System monitoring: Every 5 minutes"
echo "• Daily summaries: Generated at 4 AM"
echo "• Log cleanup: Weekly (30+ day old files)"
echo
log_success "🎉 DashAway logging system setup complete!"

exit 0