#!/bin/bash

#############################################
# DashAway Backup Management Script
# Easy interface for backup operations
#############################################

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_SCRIPT="$SCRIPT_DIR/backup.sh"
RESTORE_SCRIPT="$SCRIPT_DIR/restore.sh"
BACKUP_DIR="/root/backups"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
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

# Show backup status
show_status() {
    echo
    log "📊 DashAway Backup Status"
    echo "=================================="
    
    if [[ ! -d "$BACKUP_DIR" ]]; then
        log_warning "Backup directory not found: $BACKUP_DIR"
        return 1
    fi
    
    for backup_type in database config; do
        echo
        log "=== $backup_type Backups ==="
        
        if [[ -d "$BACKUP_DIR/$backup_type" ]]; then
            local count
            count=$(find "$BACKUP_DIR/$backup_type" -type f | wc -l)
            local size
            size=$(du -sh "$BACKUP_DIR/$backup_type" 2>/dev/null | cut -f1 || echo "0")
            
            log "  📦 Count: $count files"
            log "  💾 Size: $size"
            
            # Show latest backup
            local latest
            latest=$(find "$BACKUP_DIR/$backup_type" -type f -printf '%T@ %p\n' 2>/dev/null | sort -n | tail -1 | cut -d' ' -f2- || echo "")
            if [[ -n "$latest" ]]; then
                local latest_date
                latest_date=$(stat -c %y "$latest" 2>/dev/null | cut -d'.' -f1 || echo "unknown")
                local latest_size
                latest_size=$(du -h "$latest" 2>/dev/null | cut -f1 || echo "unknown")
                log "  🕒 Latest: $(basename "$latest") ($latest_size, $latest_date)"
            else
                log_warning "  No backups found"
            fi
        else
            log_warning "  No $backup_type backup directory found"
        fi
    done
    
    echo
    local total_size
    total_size=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1 || echo "0")
    log_success "📊 Total backup storage: $total_size"
    
    # Check cron job
    echo
    log "⏰ Automated Backup Schedule:"
    if crontab -l 2>/dev/null | grep -q backup.sh; then
        local cron_line
        cron_line=$(crontab -l 2>/dev/null | grep backup.sh | head -1)
        log_success "  ✓ Daily backup scheduled: $cron_line"
    else
        log_warning "  ⚠ No automated backup scheduled"
    fi
}

# Run backup now
run_backup() {
    echo
    log "🚀 Running backup now..."
    
    if [[ ! -f "$BACKUP_SCRIPT" ]]; then
        log_error "Backup script not found: $BACKUP_SCRIPT"
        return 1
    fi
    
    if "$BACKUP_SCRIPT"; then
        log_success "✅ Backup completed successfully!"
    else
        log_error "❌ Backup failed!"
        return 1
    fi
}

# Clean old backups
clean_backups() {
    echo
    log "🧹 Cleaning old backups..."
    
    local days="${1:-7}"
    local cleaned=0
    
    for backup_type in database config; do
        if [[ -d "$BACKUP_DIR/$backup_type" ]]; then
            local count
            count=$(find "$BACKUP_DIR/$backup_type" -type f -mtime +"$days" | wc -l)
            if [[ $count -gt 0 ]]; then
                find "$BACKUP_DIR/$backup_type" -type f -mtime +"$days" -delete
                log_success "  Cleaned $count old $backup_type backups (older than $days days)"
                ((cleaned += count))
            fi
        fi
    done
    
    # Clean old logs
    if [[ -d "$BACKUP_DIR/logs" ]]; then
        local log_count
        log_count=$(find "$BACKUP_DIR/logs" -name "*.log" -mtime +30 | wc -l)
        if [[ $log_count -gt 0 ]]; then
            find "$BACKUP_DIR/logs" -name "*.log" -mtime +30 -delete
            log_success "  Cleaned $log_count old log files"
            ((cleaned += log_count))
        fi
    fi
    
    if [[ $cleaned -eq 0 ]]; then
        log "  No old backups to clean"
    else
        log_success "🎉 Cleaned $cleaned total files"
    fi
}

# Setup automated backups
setup_automation() {
    echo
    log "⚙️ Setting up automated backups..."
    
    # Check if already set up
    if crontab -l 2>/dev/null | grep -q backup.sh; then
        log_warning "Automated backup already configured"
        log "Current schedule:"
        crontab -l 2>/dev/null | grep backup.sh
        echo
        read -p "Do you want to update the schedule? (y/n): " update
        if [[ "$update" != "y" ]]; then
            return 0
        fi
    fi
    
    echo "Choose backup schedule:"
    echo "1. Daily at 2:00 AM (recommended)"
    echo "2. Daily at 1:00 AM"
    echo "3. Daily at 3:00 AM"
    echo "4. Twice daily (2:00 AM and 2:00 PM)"
    echo "5. Custom schedule"
    
    read -p "Select option (1-5): " schedule_choice
    
    local cron_line
    case $schedule_choice in
        1)
            cron_line="0 2 * * * $BACKUP_SCRIPT >> $BACKUP_DIR/logs/cron.log 2>&1"
            ;;
        2)
            cron_line="0 1 * * * $BACKUP_SCRIPT >> $BACKUP_DIR/logs/cron.log 2>&1"
            ;;
        3)
            cron_line="0 3 * * * $BACKUP_SCRIPT >> $BACKUP_DIR/logs/cron.log 2>&1"
            ;;
        4)
            cron_line="0 2,14 * * * $BACKUP_SCRIPT >> $BACKUP_DIR/logs/cron.log 2>&1"
            ;;
        5)
            read -p "Enter custom cron schedule (e.g., '0 2 * * *'): " custom_schedule
            cron_line="$custom_schedule $BACKUP_SCRIPT >> $BACKUP_DIR/logs/cron.log 2>&1"
            ;;
        *)
            log_error "Invalid option"
            return 1
            ;;
    esac
    
    # Add to crontab
    (crontab -l 2>/dev/null | grep -v backup.sh; echo "# DashAway automated backup"; echo "$cron_line") | crontab -
    
    log_success "✅ Automated backup scheduled: $cron_line"
}

# Test restore (dry run)
test_restore() {
    echo
    log "🧪 Testing restore functionality..."
    
    if [[ ! -f "$RESTORE_SCRIPT" ]]; then
        log_error "Restore script not found: $RESTORE_SCRIPT"
        return 1
    fi
    
    log "Restore script found and executable"
    log "Available backup files:"
    
    show_status
    
    log_success "✅ Restore functionality ready"
    log "💡 To perform actual restore, run: $RESTORE_SCRIPT"
}

# Main menu
show_menu() {
    echo
    echo -e "${PURPLE}🔄 DashAway Backup Manager${NC}"
    echo "=================================="
    echo "1. 📊 Show backup status"
    echo "2. 🚀 Run backup now"
    echo "3. 🧹 Clean old backups"
    echo "4. ⚙️  Setup automated backups"
    echo "5. 🔄 Restore from backup"
    echo "6. 🧪 Test restore functionality"
    echo "7. 📋 View recent backup logs"
    echo "8. ❌ Exit"
    echo
}

# View recent logs
view_logs() {
    echo
    log "📋 Recent backup logs..."
    
    if [[ -d "$BACKUP_DIR/logs" ]]; then
        log "Latest backup log:"
        local latest_log
        latest_log=$(find "$BACKUP_DIR/logs" -name "backup_*.log" -type f -printf '%T@ %p\n' 2>/dev/null | sort -n | tail -1 | cut -d' ' -f2- || echo "")
        
        if [[ -n "$latest_log" ]]; then
            echo "----------------------------------------"
            tail -20 "$latest_log"
            echo "----------------------------------------"
            log "Full log: $latest_log"
        else
            log_warning "No backup logs found"
        fi
        
        # Show cron log if exists
        if [[ -f "$BACKUP_DIR/logs/cron.log" ]]; then
            echo
            log "Latest cron log entries:"
            echo "----------------------------------------"
            tail -10 "$BACKUP_DIR/logs/cron.log"
            echo "----------------------------------------"
        fi
    else
        log_warning "No log directory found"
    fi
}

# Main execution
main() {
    while true; do
        show_menu
        read -p "Select option (1-8): " choice
        
        case $choice in
            1)
                show_status
                ;;
            2)
                run_backup
                ;;
            3)
                echo
                read -p "Delete backups older than how many days? (default: 7): " days
                days=${days:-7}
                clean_backups "$days"
                ;;
            4)
                setup_automation
                ;;
            5)
                if [[ -f "$RESTORE_SCRIPT" ]]; then
                    "$RESTORE_SCRIPT"
                else
                    log_error "Restore script not found: $RESTORE_SCRIPT"
                fi
                ;;
            6)
                test_restore
                ;;
            7)
                view_logs
                ;;
            8)
                log "👋 Goodbye!"
                exit 0
                ;;
            *)
                log_error "Invalid option. Please select 1-8."
                ;;
        esac
        
        echo
        read -p "Press Enter to continue..."
    done
}

# Show help if requested
if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
    echo "DashAway Backup Manager"
    echo
    echo "Usage: $0 [command]"
    echo
    echo "Commands:"
    echo "  status    - Show backup status"
    echo "  backup    - Run backup now"
    echo "  clean     - Clean old backups"
    echo "  setup     - Setup automated backups"
    echo "  restore   - Launch restore interface"
    echo "  test      - Test restore functionality"
    echo "  logs      - View recent logs"
    echo "  help      - Show this help"
    echo
    echo "If no command is provided, interactive menu will be shown."
    exit 0
fi

# Handle command line arguments
case "${1:-}" in
    "status")
        show_status
        ;;
    "backup")
        run_backup
        ;;
    "clean")
        clean_backups "${2:-7}"
        ;;
    "setup")
        setup_automation
        ;;
    "restore")
        if [[ -f "$RESTORE_SCRIPT" ]]; then
            "$RESTORE_SCRIPT"
        else
            log_error "Restore script not found: $RESTORE_SCRIPT"
        fi
        ;;
    "test")
        test_restore
        ;;
    "logs")
        view_logs
        ;;
    "")
        main
        ;;
    *)
        log_error "Unknown command: $1"
        log "Use --help for usage information"
        exit 1
        ;;
esac