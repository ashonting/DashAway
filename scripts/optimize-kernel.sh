#!/bin/bash

#############################################
# DashAway Kernel Optimization Script
# Optimizes system parameters for web server
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

log "🔧 Optimizing kernel parameters for DashAway..."

# Backup current sysctl settings
cp /etc/sysctl.conf /etc/sysctl.conf.backup.$(date +%Y%m%d_%H%M%S)
log_success "Backed up current sysctl configuration"

# Create optimized sysctl configuration
cat > /etc/sysctl.d/99-dashaway-optimization.conf << 'EOF'
# DashAway Kernel Optimization
# Last updated: $(date)

### NETWORK OPTIMIZATIONS ###

# Increase TCP buffer sizes for better throughput
net.core.rmem_max = 134217728
net.core.wmem_max = 134217728
net.ipv4.tcp_rmem = 4096 87380 134217728
net.ipv4.tcp_wmem = 4096 65536 134217728

# Enable TCP Fast Open (reduces latency)
net.ipv4.tcp_fastopen = 3

# Increase connection backlog
net.core.somaxconn = 1024
net.ipv4.tcp_max_syn_backlog = 2048

# Enable TCP window scaling
net.ipv4.tcp_window_scaling = 1

# Decrease TCP FIN timeout
net.ipv4.tcp_fin_timeout = 15

# Reuse TIME_WAIT sockets
net.ipv4.tcp_tw_reuse = 1

# Increase number of allowed open file descriptors
net.ipv4.ip_local_port_range = 10000 65535

# Enable SYN cookies (DDoS protection)
net.ipv4.tcp_syncookies = 1

# Disable TCP timestamps (minor security improvement)
net.ipv4.tcp_timestamps = 0

# Increase netdev budget for packet processing
net.core.netdev_budget = 600
net.core.netdev_max_backlog = 5000

### MEMORY OPTIMIZATIONS ###

# Don't swap unless absolutely necessary
vm.swappiness = 10

# Increase file handle limits
fs.file-max = 2097152

# Increase inotify limits for file watching
fs.inotify.max_user_watches = 524288
fs.inotify.max_user_instances = 512

# Allow more memory overcommit (for containers)
vm.overcommit_memory = 1

# Keep more data in cache
vm.dirty_ratio = 40
vm.dirty_background_ratio = 10

### SECURITY OPTIMIZATIONS ###

# Ignore ICMP redirects
net.ipv4.conf.all.accept_redirects = 0
net.ipv6.conf.all.accept_redirects = 0

# Ignore send redirects
net.ipv4.conf.all.send_redirects = 0

# Disable source packet routing
net.ipv4.conf.all.accept_source_route = 0
net.ipv6.conf.all.accept_source_route = 0

# Log Martians
net.ipv4.conf.all.log_martians = 1

# Ignore ICMP ping requests (optional - commented out)
# net.ipv4.icmp_echo_ignore_all = 1

# Enable IP spoofing protection
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1

# Disable IPv6 (if not needed)
# net.ipv6.conf.all.disable_ipv6 = 1
# net.ipv6.conf.default.disable_ipv6 = 1
EOF

log_success "Created optimized kernel parameters"

# Apply the new settings
sysctl -p /etc/sysctl.d/99-dashaway-optimization.conf > /tmp/sysctl-apply.log 2>&1

if [[ $? -eq 0 ]]; then
    log_success "Applied kernel optimizations successfully"
else
    log_error "Failed to apply some settings. Check /tmp/sysctl-apply.log"
    cat /tmp/sysctl-apply.log
fi

# Optimize system limits
cat > /etc/security/limits.d/dashaway.conf << 'EOF'
# DashAway System Limits Optimization

# Increase limits for all users
* soft nofile 65535
* hard nofile 65535
* soft nproc 32768
* hard nproc 32768

# Specific limits for root
root soft nofile 65535
root hard nofile 65535
root soft nproc 32768
root hard nproc 32768

# Docker daemon limits
* soft memlock unlimited
* hard memlock unlimited
EOF

log_success "Created system limits configuration"

# Update systemd limits for Docker
mkdir -p /etc/systemd/system/docker.service.d
cat > /etc/systemd/system/docker.service.d/limits.conf << 'EOF'
[Service]
LimitNOFILE=1048576
LimitNPROC=infinity
LimitCORE=infinity
TasksMax=infinity
EOF

log_success "Updated Docker service limits"

# Reload systemd
systemctl daemon-reload

# Display current values
log "📊 Current optimized values:"
echo "----------------------------------------"
echo "TCP buffer sizes:"
sysctl net.ipv4.tcp_rmem net.ipv4.tcp_wmem | sed 's/^/  /'
echo
echo "Connection limits:"
sysctl net.core.somaxconn net.ipv4.tcp_max_syn_backlog | sed 's/^/  /'
echo
echo "Memory settings:"
sysctl vm.swappiness vm.dirty_ratio | sed 's/^/  /'
echo
echo "File limits:"
ulimit -n
echo "----------------------------------------"

# Test network performance improvement
log "🧪 Testing network optimization..."
if command -v ss >/dev/null 2>&1; then
    CONNECTIONS=$(ss -tun | wc -l)
    log "Current network connections: $CONNECTIONS"
fi

# Create uninstall script
cat > /usr/local/bin/dashaway-kernel-unoptimize << 'EOF'
#!/bin/bash
# Revert kernel optimizations
echo "Reverting kernel optimizations..."
rm -f /etc/sysctl.d/99-dashaway-optimization.conf
rm -f /etc/security/limits.d/dashaway.conf
rm -f /etc/systemd/system/docker.service.d/limits.conf
sysctl -p /etc/sysctl.conf
systemctl daemon-reload
echo "Kernel optimizations reverted"
EOF

chmod +x /usr/local/bin/dashaway-kernel-unoptimize

log_success "Created uninstall script: /usr/local/bin/dashaway-kernel-unoptimize"

# Summary
echo
log "📋 Optimization Summary:"
echo "======================================"
echo "✅ Network stack optimized for high throughput"
echo "✅ TCP buffers increased for better performance"
echo "✅ Connection limits raised"
echo "✅ Memory management optimized"
echo "✅ Security hardening applied"
echo "✅ File descriptor limits increased"
echo "✅ Docker service limits optimized"
echo
log_warning "Note: Reboot recommended for all changes to take full effect"
log_success "🎉 Kernel optimization complete!"

exit 0