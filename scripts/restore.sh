#!/bin/bash

#############################################
# DashAway Backup Restoration Script
# Restores database, configuration, and application files
#############################################

set -euo pipefail

# Configuration
BACKUP_DIR="/root/backups"

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

# Function to list available backups
list_backups() {
    local backup_type="$1"
    log "📋 Available $backup_type backups:"
    
    if [[ -d "$BACKUP_DIR/$backup_type" ]]; then
        ls -la "$BACKUP_DIR/$backup_type" | grep -E "\.(tar\.gz|sql\.gz)$" | \
        awk '{print NR ". " $9 " (" $5 " bytes, " $6 " " $7 " " $8 ")"}'
    else
        log_warning "No $backup_type backups found"
        return 1
    fi
}

# Function to restore database
restore_database() {
    log "🗄️ Database Restoration"
    
    if ! list_backups "database"; then
        return 1
    fi
    
    echo
    read -p "Enter the backup filename to restore (or 'cancel'): " backup_file
    
    if [[ "$backup_file" == "cancel" ]]; then
        log "Database restoration cancelled"
        return 0
    fi
    
    BACKUP_PATH="$BACKUP_DIR/database/$backup_file"
    
    if [[ ! -f "$BACKUP_PATH" ]]; then
        log_error "Backup file not found: $BACKUP_PATH"
        return 1
    fi
    
    # Get database URL
    if [[ -f "/root/DashAway/.env" ]]; then
        source /root/DashAway/.env
        
        if [[ -z "${DATABASE_URL:-}" ]]; then
            log_error "DATABASE_URL not found in .env file"
            return 1
        fi
        
        log_warning "⚠️  This will OVERWRITE your current database!"
        read -p "Are you sure you want to continue? (yes/no): " confirm
        
        if [[ "$confirm" != "yes" ]]; then
            log "Database restoration cancelled"
            return 0
        fi
        
        log "Restoring database from: $backup_file"
        
        # Create temporary SQL file
        TEMP_SQL="/tmp/restore_$(date +%s).sql"
        
        if [[ "$backup_file" == *.gz ]]; then
            gunzip -c "$BACKUP_PATH" > "$TEMP_SQL"
        else
            cp "$BACKUP_PATH" "$TEMP_SQL"
        fi
        
        # Restore database
        if command -v psql >/dev/null 2>&1; then
            psql "$DATABASE_URL" < "$TEMP_SQL"
        else
            docker run --rm -i postgres:15-alpine psql "$DATABASE_URL" < "$TEMP_SQL"
        fi
        
        rm -f "$TEMP_SQL"
        log_success "Database restored successfully"
        
    else
        log_error ".env file not found"
        return 1
    fi
}

# Function to restore configuration
restore_config() {
    log "📁 Configuration Restoration"
    
    if ! list_backups "config"; then
        return 1
    fi
    
    echo
    read -p "Enter the backup filename to restore (or 'cancel'): " backup_file
    
    if [[ "$backup_file" == "cancel" ]]; then
        log "Configuration restoration cancelled"
        return 0
    fi
    
    BACKUP_PATH="$BACKUP_DIR/config/$backup_file"
    
    if [[ ! -f "$BACKUP_PATH" ]]; then
        log_error "Backup file not found: $BACKUP_PATH"
        return 1
    fi
    
    log_warning "⚠️  This will overwrite current configuration files!"
    read -p "Are you sure you want to continue? (yes/no): " confirm
    
    if [[ "$confirm" != "yes" ]]; then
        log "Configuration restoration cancelled"
        return 0
    fi
    
    log "Restoring configuration from: $backup_file"
    
    # Create temporary directory
    TEMP_DIR="/tmp/restore_config_$(date +%s)"
    mkdir -p "$TEMP_DIR"
    
    # Extract backup
    tar -xzf "$BACKUP_PATH" -C "$TEMP_DIR"
    
    # Restore files (with backup of current files)
    BACKUP_TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    
    for file in "$TEMP_DIR"/*; do
        if [[ -f "$file" ]]; then
            filename=$(basename "$file")
            
            # Determine target location based on filename
            case "$filename" in
                ".env")
                    TARGET="/root/DashAway/.env"
                    ;;
                "docker-compose.prod.yml")
                    TARGET="/root/DashAway/docker-compose.prod.yml"
                    ;;
                "nginx.conf")
                    TARGET="/root/DashAway/nginx.conf"
                    ;;
                ".env.local")
                    TARGET="/root/DashAway/frontend/.env.local"
                    ;;
                "dashaway.service")
                    TARGET="/etc/systemd/system/dashaway.service"
                    ;;
                *)
                    log_warning "Unknown config file: $filename, skipping"
                    continue
                    ;;
            esac
            
            # Backup current file if it exists
            if [[ -f "$TARGET" ]]; then
                cp "$TARGET" "${TARGET}.backup.${BACKUP_TIMESTAMP}"
                log "Backed up current file: ${TARGET}.backup.${BACKUP_TIMESTAMP}"
            fi
            
            # Restore file
            cp "$file" "$TARGET"
            log_success "Restored: $TARGET"
        fi
    done
    
    rm -rf "$TEMP_DIR"
    log_success "Configuration restored successfully"
}

# Function to show backup status
show_status() {
    log "📊 Backup Status Report"
    echo
    
    for backup_type in database config; do
        log "=== $backup_type Backups ==="
        if [[ -d "$BACKUP_DIR/$backup_type" ]]; then
            local count
            count=$(find "$BACKUP_DIR/$backup_type" -type f | wc -l)
            local size
            size=$(du -sh "$BACKUP_DIR/$backup_type" 2>/dev/null | cut -f1 || echo "0")
            
            log "  Count: $count files"
            log "  Size: $size"
            
            # Show latest backup
            local latest
            latest=$(find "$BACKUP_DIR/$backup_type" -type f -printf '%T@ %p\n' | sort -n | tail -1 | cut -d' ' -f2- || echo "")
            if [[ -n "$latest" ]]; then
                local latest_date
                latest_date=$(stat -c %y "$latest" | cut -d'.' -f1)
                log "  Latest: $(basename "$latest") ($latest_date)"
            fi
        else
            log_warning "  No $backup_type backups found"
        fi
        echo
    done
    
    # Show total backup size
    local total_size
    total_size=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1 || echo "0")
    log_success "Total backup storage: $total_size"
}

# Main menu
main_menu() {
    while true; do
        echo
        log "🔄 DashAway Backup Restoration Tool"
        log "================================="
        echo "1. Show backup status"
        echo "2. Restore database"
        echo "3. Restore configuration"
        echo "4. List all backups"
        echo "5. Exit"
        echo
        read -p "Select an option (1-5): " choice
        
        case $choice in
            1)
                show_status
                ;;
            2)
                restore_database
                ;;
            3)
                restore_config
                ;;
            4)
                log "📋 All Available Backups"
                echo
                for backup_type in database config; do
                    log "=== $backup_type ==="
                    list_backups "$backup_type" || true
                    echo
                done
                ;;
            5)
                log "Goodbye!"
                exit 0
                ;;
            *)
                log_error "Invalid option. Please select 1-5."
                ;;
        esac
    done
}

# Run main menu if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main_menu
fi