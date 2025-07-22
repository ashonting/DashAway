# DashAway Production Deployment Guide - dashaway.io

## Prerequisites
- ✅ Digital Ocean Droplet: 1GB/25GB disk/Ubuntu 24.04 (LTS) x64
- ✅ Domain: dashaway.io
- SSH access to your droplet

## 🎯 Optimized for 1GB Droplet

## Quick Deployment Steps

### 1. Connect to Your Droplet
```bash
ssh root@your-droplet-ip
```

### 2. Install Dependencies
```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose and other tools
apt install docker-compose git nginx certbot python3-certbot-nginx -y

# Start Docker
systemctl start docker && systemctl enable docker
```

### 3. Clone and Setup Application
```bash
# Navigate to web directory
cd /var/www

# Clone your repository
git clone https://github.com/yourusername/dashaway.git
cd dashaway

# Copy production environment template
cp .env.production .env
```

### 4. Configure Environment Variables
Edit the `.env` file with your actual values:
```bash
nano .env
```

**Required changes:**
- `DATABASE_URL`: Your Supabase database URL
- `JWT_SECRET`: Generate with `openssl rand -base64 32`
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
- `ADMIN_PASSWORD`: Your secure admin password
- `CORS_ORIGINS`: Your domain (https://yourdomain.com,https://www.yourdomain.com)
- `NEXT_PUBLIC_API_URL`: Your domain (https://yourdomain.com)

### 5. Configure Domain in Files
Edit these files and replace "yourdomain.com" with your actual domain:
```bash
nano nginx.conf
nano deploy.sh
```

### 6. Run 1GB-Optimized Deployment
```bash
chmod +x deploy-1gb.sh
./deploy-1gb.sh
```

### 7. Configure DNS
Point dashaway.io's A records to your droplet's IP address:
- `dashaway.io` → Your Droplet IP  
- `www.dashaway.io` → Your Droplet IP

**Important:** Wait for DNS propagation before running the deployment script (usually 5-15 minutes).

## Post-Deployment

### Monitor Logs
```bash
docker-compose -f docker-compose.prod.yml logs -f
```

### Restart Application
```bash
systemctl restart dashaway
```

### Update Application
```bash
git pull
docker-compose -f docker-compose.prod.yml up --build -d
```

### SSL Certificate Renewal
Certificates auto-renew via cron. To test renewal:
```bash
certbot renew --dry-run
```

## Troubleshooting

### Check Service Status
```bash
systemctl status dashaway
systemctl status nginx
docker-compose -f docker-compose.prod.yml ps
```

### View Logs
```bash
# Application logs
docker-compose -f docker-compose.prod.yml logs -f

# Nginx logs
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

### Common Issues

1. **503 Service Unavailable**: Check if containers are running
2. **SSL Certificate Issues**: Ensure DNS is pointing to your server
3. **Database Connection**: Verify DATABASE_URL in .env file
4. **CORS Errors**: Check CORS_ORIGINS in .env file

## Security Recommendations

1. **Firewall Configuration**:
   ```bash
   ufw allow 22/tcp   # SSH
   ufw allow 80/tcp   # HTTP
   ufw allow 443/tcp  # HTTPS
   ufw --force enable
   ```

2. **Regular Updates**:
   ```bash
   apt update && apt upgrade -y
   ```

3. **Monitor Resources**:
   ```bash
   htop
   df -h
   docker stats
   ```

## Backup Strategy

1. **Database**: Regular Supabase backups (handled by Supabase)
2. **Application**: Git repository backup
3. **Environment**: Secure backup of `.env` file
4. **SSL Certificates**: Automatic renewal via Let's Encrypt

## Performance Optimization

1. **Enable Gzip**: Already configured in nginx.conf
2. **Static File Caching**: Already configured
3. **Docker Resource Limits**: Add to docker-compose.prod.yml if needed
4. **Database Connection Pooling**: Already handled by SQLAlchemy

Your DashAway application should now be live at https://yourdomain.com! 🚀