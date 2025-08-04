#!/bin/bash

#############################################
# DashAway Health Monitor
# Simple system health monitoring with alerts
#############################################

set -euo pipefail

# Configuration
ALERT_EMAIL="${ALERT_EMAIL:-}"  # Set in environment
ALERT_THRESHOLD_CPU=80
ALERT_THRESHOLD_MEMORY=85
ALERT_THRESHOLD_DISK=80
ALERT_THRESHOLD_DOCKER_DOWN=1
LOG_FILE="/var/log/dashaway/system/health-monitor.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create log directory if needed
mkdir -p "$(dirname "$LOG_FILE")"

log() {
    local level=$1
    shift
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [$level] $*" | tee -a "$LOG_FILE"
}

send_alert() {
    local subject=$1
    local message=$2
    
    log "ALERT" "$subject: $message"
    
    # If email is configured, send alert
    if [[ -n "$ALERT_EMAIL" ]] && command -v mail >/dev/null 2>&1; then
        echo "$message" | mail -s "[DashAway Alert] $subject" "$ALERT_EMAIL" 2>/dev/null || true
    fi
    
    # Also log to system journal if available
    if command -v logger >/dev/null 2>&1; then
        logger -t dashaway-health -p user.warning "$subject: $message"
    fi
}

check_cpu() {
    local cpu_usage
    cpu_usage=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}' | cut -d. -f1)
    
    log "INFO" "CPU Usage: ${cpu_usage}%"
    
    if [[ $cpu_usage -gt $ALERT_THRESHOLD_CPU ]]; then
        send_alert "High CPU Usage" "CPU usage is at ${cpu_usage}% (threshold: ${ALERT_THRESHOLD_CPU}%)"
        return 1
    fi
    return 0
}

check_memory() {
    local memory_usage
    memory_usage=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
    
    log "INFO" "Memory Usage: ${memory_usage}%"
    
    if [[ $memory_usage -gt $ALERT_THRESHOLD_MEMORY ]]; then
        local memory_details
        memory_details=$(free -h | grep -E "Mem|Swap")
        send_alert "High Memory Usage" "Memory usage is at ${memory_usage}% (threshold: ${ALERT_THRESHOLD_MEMORY}%)\n\n$memory_details"
        return 1
    fi
    return 0
}

check_disk() {
    local disk_usage
    disk_usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    
    log "INFO" "Disk Usage: ${disk_usage}%"
    
    if [[ $disk_usage -gt $ALERT_THRESHOLD_DISK ]]; then
        local disk_details
        disk_details=$(df -h /)
        send_alert "High Disk Usage" "Disk usage is at ${disk_usage}% (threshold: ${ALERT_THRESHOLD_DISK}%)\n\n$disk_details"
        return 1
    fi
    return 0
}

check_docker() {
    if ! command -v docker >/dev/null 2>&1; then
        log "WARNING" "Docker not installed"
        return 0
    fi
    
    local containers_running
    local containers_expected=5  # backend, frontend, glitchtip, postgres, redis
    containers_running=$(docker ps --format "{{.Names}}" | wc -l)
    
    log "INFO" "Docker Containers: ${containers_running} running"
    
    if [[ $containers_running -lt $containers_expected ]]; then
        local container_status
        container_status=$(docker ps -a --format "table {{.Names}}\t{{.Status}}" | head -10)
        send_alert "Docker Containers Down" "Only ${containers_running}/${containers_expected} containers are running\n\n$container_status"
        return 1
    fi
    
    # Check for unhealthy containers
    local unhealthy_count
    unhealthy_count=$(docker ps --filter "health=unhealthy" --format "{{.Names}}" | wc -l)
    
    if [[ $unhealthy_count -gt 0 ]]; then
        local unhealthy_containers
        unhealthy_containers=$(docker ps --filter "health=unhealthy" --format "{{.Names}}: {{.Status}}")
        send_alert "Unhealthy Containers" "${unhealthy_count} containers are unhealthy:\n$unhealthy_containers"
        return 1
    fi
    
    return 0
}

check_services() {
    local issues=0
    
    # Check nginx
    if systemctl is-active --quiet nginx; then
        log "INFO" "Nginx: Active"
    else
        send_alert "Nginx Down" "Nginx service is not running"
        ((issues++))
    fi
    
    # Check if backend responds
    if curl -sf http://localhost:8000/health >/dev/null 2>&1; then
        log "INFO" "Backend API: Healthy"
    else
        send_alert "Backend API Down" "Backend API health check failed"
        ((issues++))
    fi
    
    # Check if frontend responds
    if curl -sf http://localhost:3000 >/dev/null 2>&1; then
        log "INFO" "Frontend: Healthy"
    else
        send_alert "Frontend Down" "Frontend health check failed"
        ((issues++))
    fi
    
    return $issues
}

check_logs() {
    # Check for recent errors in logs
    local error_count
    error_count=$(find /var/log/dashaway -name "*.log" -mmin -5 -exec grep -i "error\|exception\|failed" {} \; 2>/dev/null | wc -l)
    
    log "INFO" "Recent Errors (5 min): ${error_count}"
    
    if [[ $error_count -gt 50 ]]; then
        local error_summary
        error_summary=$(find /var/log/dashaway -name "*.log" -mmin -5 -exec grep -i "error\|exception\|failed" {} \; 2>/dev/null | head -10)
        send_alert "High Error Rate" "${error_count} errors in the last 5 minutes\n\nSample errors:\n$error_summary"
        return 1
    fi
    return 0
}

generate_summary() {
    local status=$1
    
    {
        echo "=== DashAway Health Check Summary ==="
        echo "Time: $(date)"
        echo "Status: $status"
        echo
        echo "System Metrics:"
        echo "- CPU: $(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')%"
        echo "- Memory: $(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')%"
        echo "- Disk: $(df / | tail -1 | awk '{print $5}')"
        echo "- Load: $(uptime | awk -F'load average:' '{print $2}')"
        echo
        echo "Docker Status:"
        docker ps --format "{{.Names}}: {{.Status}}" 2>/dev/null || echo "Docker not available"
        echo
    } >> "$LOG_FILE"
}

# Main execution
main() {
    local overall_status="HEALTHY"
    local issues=0
    
    log "INFO" "Starting health check..."
    
    # Run all checks
    check_cpu || ((issues++))
    check_memory || ((issues++))
    check_disk || ((issues++))
    check_docker || ((issues++))
    check_services || ((issues+=$?))
    check_logs || ((issues++))
    
    if [[ $issues -gt 0 ]]; then
        overall_status="UNHEALTHY ($issues issues)"
    fi
    
    generate_summary "$overall_status"
    log "INFO" "Health check completed: $overall_status"
    
    # Exit with appropriate code
    [[ $issues -eq 0 ]] && exit 0 || exit 1
}

# Handle script arguments
case "${1:-check}" in
    check)
        main
        ;;
    install)
        # Install as cron job
        echo "Installing health monitor cron job..."
        (crontab -l 2>/dev/null | grep -v health-monitor; echo "*/5 * * * * $0 check >/dev/null 2>&1") | crontab -
        echo "Health monitor installed to run every 5 minutes"
        ;;
    uninstall)
        # Remove from cron
        echo "Removing health monitor cron job..."
        crontab -l 2>/dev/null | grep -v health-monitor | crontab -
        echo "Health monitor cron job removed"
        ;;
    *)
        echo "Usage: $0 {check|install|uninstall}"
        exit 1
        ;;
esac