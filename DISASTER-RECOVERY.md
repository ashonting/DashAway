# DashAway Disaster Recovery Documentation

## Overview
This document outlines the disaster recovery procedures for the DashAway SaaS application, including backup strategies, recovery procedures, and business continuity plans.

## Critical System Components

### 1. Application Infrastructure
- **Frontend**: Next.js application deployed via Docker on Digital Ocean Droplet
- **Backend**: FastAPI application deployed via Docker on Digital Ocean Droplet
- **Database**: Supabase PostgreSQL (managed service)
- **Authentication**: Supabase Auth (managed service)
- **File Storage**: Supabase Storage (managed service)
- **Payments**: Paddle (external service)
- **Code Repository**: GitHub (primary source of truth)

### 2. Server Details
- **Production Server**: root@209.97.145.242 (Digital Ocean Droplet)
- **SSH Key**: `~/.ssh/id_rsa_pem`
- **Application Directory**: `/root/DashAway`
- **Docker Compose**: `docker-compose.prod.yml`

## Backup Strategy

### 1. Database Backups (Supabase)
**Automatic Backups:**
- Supabase provides automated daily backups with 7-day retention
- Point-in-time recovery available for paid plans
- Backups stored in multiple availability zones

**Manual Backup Process:**
```bash
# Export database schema and data
supabase db dump --schema-only > schema_backup_$(date +%Y%m%d).sql
supabase db dump --data-only > data_backup_$(date +%Y%m%d).sql

# Or full backup
pg_dump "postgresql://postgres.vsjxnobjkkesyszhpweu:PASSWORD@aws-0-us-east-2.pooler.supabase.com:5432/postgres" > full_backup_$(date +%Y%m%d).sql
```

### 2. Code and Configuration Backups
**Primary Repository:**
- GitHub: https://github.com/ashonting/DashAway.git
- All code changes are version controlled
- Environment files are NOT in repository (security)

**Environment Configuration Backup:**
```bash
# Backup critical environment files
scp -i ~/.ssh/id_rsa_pem root@209.97.145.242:/root/DashAway/.env ./backups/env_backup_$(date +%Y%m%d).env
scp -i ~/.ssh/id_rsa_pem root@209.97.145.242:/root/DashAway/docker-compose.prod.yml ./backups/
```

### 3. Server Configuration Backup
```bash
# Backup nginx configuration if applicable
scp -i ~/.ssh/id_rsa_pem root@209.97.145.242:/etc/nginx/nginx.conf ./backups/

# Backup Docker images
ssh -i ~/.ssh/id_rsa_pem root@209.97.145.242 "docker save dashaway_frontend:latest" > ./backups/frontend_image_$(date +%Y%m%d).tar
ssh -i ~/.ssh/id_rsa_pem root@209.97.145.242 "docker save dashaway_backend:latest" > ./backups/backend_image_$(date +%Y%m%d).tar
```

## Recovery Procedures

### 1. Complete Server Loss Recovery

**Prerequisites:**
- Access to GitHub repository
- Backup of `.env` file
- Digital Ocean account access
- SSH key (`id_rsa_pem`)

**Steps:**
1. **Create New Digital Ocean Droplet**
   ```bash
   # Create Ubuntu 22.04 droplet with at least 2GB RAM
   # Enable automated backups
   # Add SSH key during creation
   ```

2. **Install Dependencies**
   ```bash
   ssh -i ~/.ssh/id_rsa_pem root@NEW_IP_ADDRESS
   
   # Update system
   apt update && apt upgrade -y
   
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   
   # Install Docker Compose
   curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   chmod +x /usr/local/bin/docker-compose
   
   # Install Git
   apt install -y git
   ```

3. **Deploy Application**
   ```bash
   # Clone repository
   cd /root
   git clone https://github.com/ashonting/DashAway.git
   cd DashAway
   
   # Restore environment configuration
   # Copy backed up .env file to server
   scp -i ~/.ssh/id_rsa_pem ./backups/env_backup_YYYYMMDD.env root@NEW_IP_ADDRESS:/root/DashAway/.env
   
   # Build and start containers
   docker-compose -f docker-compose.prod.yml build
   docker-compose -f docker-compose.prod.yml up -d
   ```

4. **Update DNS Records**
   ```bash
   # Update A record for dashaway.io to point to NEW_IP_ADDRESS
   # Wait for DNS propagation (up to 24 hours)
   ```

### 2. Database Recovery

**From Supabase Backup:**
1. Access Supabase Dashboard
2. Navigate to Database → Backups
3. Select backup date and restore

**From Manual Backup:**
```bash
# Restore from SQL backup
psql "postgresql://postgres.vsjxnobjkkesyszhpweu:PASSWORD@aws-0-us-east-2.pooler.supabase.com:5432/postgres" < full_backup_YYYYMMDD.sql
```

### 3. Application-Only Recovery

**If server is healthy but application is corrupted:**
```bash
ssh -i ~/.ssh/id_rsa_pem root@209.97.145.242

# Stop containers
cd /root/DashAway
docker-compose -f docker-compose.prod.yml down

# Reset to latest code
git stash
git reset --hard origin/main
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

### 4. Supabase Service Recovery

**If Supabase is unavailable:**
1. Check Supabase status page: https://status.supabase.com/
2. If extended outage, consider temporary migration:
   ```bash
   # Set up temporary PostgreSQL instance
   docker run -d --name temp-postgres \
     -e POSTGRES_PASSWORD=temppass \
     -e POSTGRES_DB=dashaway \
     -p 5432:5432 \
     postgres:15
   
   # Update DATABASE_URL in .env to point to temporary instance
   # Restore from backup
   ```

## Business Continuity

### 1. RTO/RPO Targets
- **Recovery Time Objective (RTO)**: 4 hours
- **Recovery Point Objective (RPO)**: 24 hours
- **Maximum Tolerable Downtime**: 8 hours

### 2. Communication Plan
**Internal Team:**
- Document incident in project management system
- Notify key stakeholders immediately

**Customer Communication:**
- Update status page if available
- Send email notifications for extended outages
- Post updates on social media channels

### 3. Escalation Procedures
1. **Immediate (0-30 minutes)**: Attempt automated recovery
2. **Short-term (30 minutes - 2 hours)**: Manual intervention
3. **Extended (2+ hours)**: Full disaster recovery procedures
4. **Critical (4+ hours)**: Consider third-party assistance

## Monitoring and Alerting

### 1. Health Checks
```bash
# Application health check
curl -f https://dashaway.io/health || echo "Application down"

# Database connectivity check
psql "postgresql://postgres.vsjxnobjkkesyszhpweu:PASSWORD@aws-0-us-east-2.pooler.supabase.com:5432/postgres" -c "SELECT 1;" || echo "Database down"
```

### 2. Automated Monitoring Setup
**Recommended tools:**
- **Uptime monitoring**: UptimeRobot or Pingdom
- **Application monitoring**: Self-hosted Sentry
- **Server monitoring**: Digital Ocean monitoring + custom scripts

### 3. Log Monitoring
```bash
# Check application logs
ssh -i ~/.ssh/id_rsa_pem root@209.97.145.242 "cd /root/DashAway && docker-compose -f docker-compose.prod.yml logs --tail=100"

# Check system logs
ssh -i ~/.ssh/id_rsa_pem root@209.97.145.242 "journalctl -u docker -n 50"
```

## Critical Environment Variables

**Essential variables to backup:**
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://vsjxnobjkkesyszhpweu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[BACKUP_REQUIRED]
SUPABASE_SERVICE_ROLE_KEY=[BACKUP_REQUIRED]
SUPABASE_JWT_SECRET=[BACKUP_REQUIRED]

# Database
DATABASE_URL=[BACKUP_REQUIRED]

# Authentication
NEXTAUTH_SECRET=[BACKUP_REQUIRED]
NEXTAUTH_URL=https://dashaway.io

# Paddle Payment Processing
PADDLE_API_KEY=[BACKUP_REQUIRED]
PADDLE_WEBHOOK_SECRET=[BACKUP_REQUIRED]
PADDLE_VENDOR_ID=241382

# Admin Access
ADMIN_USERNAME=admin
ADMIN_PASSWORD=[BACKUP_REQUIRED]

# Security
JWT_SECRET=[BACKUP_REQUIRED]
```

## Testing Recovery Procedures

### 1. Monthly Disaster Recovery Tests
- Test database backup and restore
- Verify environment variable backups
- Test application deployment on fresh server

### 2. Quarterly Full Recovery Tests
- Complete server rebuild simulation
- End-to-end application functionality testing
- DNS failover testing

### 3. Annual Business Continuity Review
- Review and update RTO/RPO targets
- Update contact information
- Review and update procedures

## Emergency Contacts

**Technical Contacts:**
- Primary Developer: [YOUR_CONTACT_INFO]
- GitHub Repository: https://github.com/ashonting/DashAway

**Service Providers:**
- Digital Ocean Support: https://cloud.digitalocean.com/support
- Supabase Support: https://supabase.com/support
- Paddle Support: https://paddle.com/support

**Domain/DNS:**
- Domain Registrar: [YOUR_REGISTRAR]
- DNS Provider: [YOUR_DNS_PROVIDER]

## Security Considerations

### 1. Backup Security
- Encrypt backups containing sensitive data
- Store backups in secure, separate location
- Regularly test backup integrity
- Limit access to backup storage

### 2. Access Management
- Rotate SSH keys quarterly
- Use strong passwords for all accounts
- Enable 2FA where available
- Regularly audit access permissions

### 3. Incident Response
- Document all security incidents
- Change passwords after security breaches
- Review logs for unauthorized access
- Update security measures based on incidents

---

**Last Updated:** [CURRENT_DATE]
**Next Review Date:** [CURRENT_DATE + 3 months]
**Document Version:** 1.0