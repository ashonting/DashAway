#!/bin/bash

#############################################
# DashAway Automated Backup Script
# Backs up database, configuration, and application files
# Retention: 7 daily, 4 weekly, 12 monthly backups
#############################################

set -euo pipefail

# Configuration
BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7
RETENTION_WEEKS=4
RETENTION_MONTHS=12

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging
LOG_FILE="$BACKUP_DIR/logs/backup_$DATE.log"
exec 1> >(tee -a "$LOG_FILE")
exec 2> >(tee -a "$LOG_FILE" >&2)

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

log "🔄 Starting DashAway backup process..."

# Create backup directories if they don't exist
mkdir -p "$BACKUP_DIR"/{database,config,logs,temp}

#############################################
# 1. APPLICATION CONFIGURATION BACKUP
#############################################

log "📁 Backing up application configuration..."

CONFIG_BACKUP_FILE="$BACKUP_DIR/config/config_$DATE.tar.gz"

# Files to backup
CONFIG_FILES=(
    "/root/DashAway/.env"
    "/root/DashAway/docker-compose.prod.yml"
    "/root/DashAway/nginx.conf"
    "/root/DashAway/frontend/.env.local"
    "/etc/systemd/system/dashaway.service"
)

# Create config backup
tar -czf "$CONFIG_BACKUP_FILE" \
    --ignore-failed-read \
    --transform 's/.*\///' \
    "${CONFIG_FILES[@]}" 2>/dev/null || true

if [[ -f "$CONFIG_BACKUP_FILE" ]]; then
    CONFIG_SIZE=$(du -h "$CONFIG_BACKUP_FILE" | cut -f1)
    log_success "Configuration backup created: $CONFIG_SIZE"
else
    log_warning "Configuration backup failed or no files found"
fi

#############################################
# 2. DATABASE BACKUP VIA pg_dump
#############################################

log "🗄️ Backing up database..."

# Extract database connection info from .env
if [[ -f "/root/DashAway/.env" ]]; then
    source /root/DashAway/.env
    
    if [[ -n "${DATABASE_URL:-}" ]]; then
        DB_BACKUP_FILE="$BACKUP_DIR/database/database_$DATE.sql"
        
        # Use docker postgres client with correct version
        docker run --rm postgres:17-alpine pg_dump "$DATABASE_URL" > "$DB_BACKUP_FILE" 2>/dev/null || {
            log_error "Database backup failed"
            rm -f "$DB_BACKUP_FILE" 2>/dev/null
        }
        
        if [[ -f "$DB_BACKUP_FILE" ]]; then
            # Compress the SQL file
            gzip "$DB_BACKUP_FILE"
            DB_SIZE=$(du -h "$DB_BACKUP_FILE.gz" | cut -f1)
            log_success "Database backup created: $DB_SIZE"
        else
            log_warning "Database backup failed"
        fi
    else
        log_warning "DATABASE_URL not found in .env file"
    fi
else
    log_warning ".env file not found"
fi

#############################################
# 3. APPLICATION FILES BACKUP
#############################################

log "📦 Backing up critical application files..."

APP_BACKUP_FILE="$BACKUP_DIR/config/app_$DATE.tar.gz"

# Critical application files to backup
APP_FILES=(
    "/root/DashAway/backend/app/middleware"
    "/root/DashAway/backend/app/routes"
    "/root/DashAway/backend/app/models"
    "/root/DashAway/backend/requirements.txt"
    "/root/DashAway/frontend/package.json"
    "/root/DashAway/frontend/next.config.mjs"
)

# Create app backup
tar -czf "$APP_BACKUP_FILE" \
    --ignore-failed-read \
    "${APP_FILES[@]}" 2>/dev/null || true

if [[ -f "$APP_BACKUP_FILE" ]]; then
    APP_SIZE=$(du -h "$APP_BACKUP_FILE" | cut -f1)
    log_success "Application files backup created: $APP_SIZE"
else
    log_warning "Application files backup failed"
fi

#############################################
# 4. DOCKER VOLUMES BACKUP
#############################################

log "🐳 Backing up Docker volumes..."

VOLUMES_BACKUP_FILE="$BACKUP_DIR/config/volumes_$DATE.tar.gz"

# Backup docker volumes if they exist
docker volume ls -q | while read -r volume; do
    if [[ "$volume" =~ (dashaway|glitchtip) ]]; then
        log "Backing up volume: $volume"
        docker run --rm -v "$volume:/data" -v "$BACKUP_DIR/temp:/backup" \
            ubuntu:latest tar -czf "/backup/volume_${volume}_$DATE.tar.gz" -C /data . 2>/dev/null || true
    fi
done

# Combine volume backups if any exist
if ls "$BACKUP_DIR/temp"/volume_*_"$DATE".tar.gz 1> /dev/null 2>&1; then
    tar -czf "$VOLUMES_BACKUP_FILE" -C "$BACKUP_DIR/temp" volume_*_"$DATE".tar.gz 2>/dev/null
    rm -f "$BACKUP_DIR/temp"/volume_*_"$DATE".tar.gz
    VOLUMES_SIZE=$(du -h "$VOLUMES_BACKUP_FILE" | cut -f1)
    log_success "Docker volumes backup created: $VOLUMES_SIZE"
else
    log "No Docker volumes to combine"
fi

#############################################
# 5. CLEANUP OLD BACKUPS
#############################################

log "🧹 Cleaning up old backups..."

cleanup_old_backups() {
    local dir="$1"
    local days="$2"
    local pattern="$3"
    
    if [[ -d "$dir" ]]; then
        local count
        count=$(find "$dir" -name "$pattern" -mtime +"$days" | wc -l)
        if [[ $count -gt 0 ]]; then
            find "$dir" -name "$pattern" -mtime +"$days" -delete
            log_success "Removed $count old backups from $dir"
        fi
    fi
}

# Clean up old backups with retention policy
cleanup_old_backups "$BACKUP_DIR/database" $RETENTION_DAYS "database_*.sql.gz"
cleanup_old_backups "$BACKUP_DIR/config" $RETENTION_DAYS "config_*.tar.gz"
cleanup_old_backups "$BACKUP_DIR/config" $RETENTION_DAYS "app_*.tar.gz"
cleanup_old_backups "$BACKUP_DIR/config" $RETENTION_DAYS "volumes_*.tar.gz"
cleanup_old_backups "$BACKUP_DIR/logs" 30 "backup_*.log"

#############################################
# 6. BACKUP SUMMARY
#############################################

log "📊 Backup Summary:"

TOTAL_SIZE=0

for backup_type in database config; do
    if [[ -d "$BACKUP_DIR/$backup_type" ]]; then
        TYPE_SIZE=$(du -sh "$BACKUP_DIR/$backup_type" 2>/dev/null | cut -f1 || echo "0")
        TYPE_COUNT=$(find "$BACKUP_DIR/$backup_type" -type f | wc -l)
        log "  $backup_type: $TYPE_SIZE ($TYPE_COUNT files)"
    fi
done

TOTAL_SIZE=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1 || echo "0")
log_success "Total backup size: $TOTAL_SIZE"

#############################################
# 7. HEALTH CHECK
#############################################

log "🏥 Running backup health check..."

HEALTH_ISSUES=0

# Check if we have recent database backup
if ! find "$BACKUP_DIR/database" -name "database_*.sql.gz" -mtime -1 | grep -q .; then
    log_warning "No recent database backup found"
    ((HEALTH_ISSUES++))
fi

# Check if we have recent config backup
if ! find "$BACKUP_DIR/config" -name "config_*.tar.gz" -mtime -1 | grep -q .; then
    log_warning "No recent config backup found"
    ((HEALTH_ISSUES++))
fi

# Check backup directory size (warn if > 1GB)
BACKUP_SIZE_MB=$(du -sm "$BACKUP_DIR" | cut -f1)
if [[ $BACKUP_SIZE_MB -gt 1024 ]]; then
    log_warning "Backup directory is large (${BACKUP_SIZE_MB}MB). Consider cleanup."
fi

if [[ $HEALTH_ISSUES -eq 0 ]]; then
    log_success "✅ All backup health checks passed"
    EXIT_CODE=0
else
    log_warning "⚠️  $HEALTH_ISSUES backup health issues found"
    EXIT_CODE=1
fi

#############################################
# 8. NOTIFICATION (Optional)
#############################################

# Send notification if email is configured
if command -v mail >/dev/null 2>&1 && [[ -n "${BACKUP_EMAIL_NOTIFY:-}" ]]; then
    if [[ $EXIT_CODE -eq 0 ]]; then
        echo "DashAway backup completed successfully at $(date)" | \
            mail -s "✅ DashAway Backup Success" "$BACKUP_EMAIL_NOTIFY" 2>/dev/null || true
    else
        echo "DashAway backup completed with warnings at $(date). Check log: $LOG_FILE" | \
            mail -s "⚠️ DashAway Backup Warning" "$BACKUP_EMAIL_NOTIFY" 2>/dev/null || true
    fi
fi

log_success "🎉 Backup process completed in $(date +%s) seconds"
echo "📋 Full log available at: $LOG_FILE"

exit $EXIT_CODE