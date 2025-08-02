# GlitchTip Error Tracking Setup Guide

## Overview
GlitchTip is now integrated into DashAway for comprehensive error tracking across both frontend and backend. This guide explains how to complete the setup.

## Step 1: Deploy GlitchTip Infrastructure

1. **Deploy the updated containers:**
   ```bash
   ./deploy-prod.sh
   ```

2. **Check if GlitchTip is running:**
   ```bash
   docker-compose -f docker-compose.prod.yml ps
   curl http://localhost:8001/api/0/health/
   ```

## Step 2: Configure GlitchTip

1. **Access GlitchTip web interface:**
   - URL: `http://YOUR_SERVER_IP:8001`
   - Or setup subdomain: `errors.dashaway.io` → `YOUR_SERVER_IP:8001`

2. **Create admin account:**
   - First user to register becomes admin
   - Use strong credentials

3. **Create organization and project:**
   - Organization: "DashAway"
   - Project: "DashAway Production"

4. **Get DSN (Data Source Name):**
   - Go to Project Settings → Client Keys (DSN)
   - Copy the DSN URL

## Step 3: Update Environment Variables

Add the DSN to your .env file:
```bash
# Replace with your actual DSN from GlitchTip
GLITCHTIP_DSN=https://your-key@errors.dashaway.io/1
```

Then rebuild and restart:
```bash
./deploy-prod.sh
```

## Step 4: Setup Nginx Proxy (Optional but Recommended)

Add to your nginx.conf:
```nginx
# GlitchTip proxy
location /errors/ {
    proxy_pass http://127.0.0.1:8001/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Then access via: `https://dashaway.io/errors/`

## Features Included

### Frontend Error Tracking
- ✅ Automatic JavaScript error capture
- ✅ Performance monitoring
- ✅ Session replay (on errors)
- ✅ User context tracking
- ✅ Custom error boundaries
- ✅ Network error filtering

### Backend Error Tracking
- ✅ FastAPI integration
- ✅ SQLAlchemy query monitoring
- ✅ Request context capture
- ✅ User session tracking
- ✅ Performance monitoring
- ✅ Custom error filtering

### Error Intelligence
- 🔍 Automatic error grouping
- 📊 Error trends and patterns
- 🚨 Email/webhook alerts
- 🏷️ Release tracking
- 🔄 Regression detection
- 📝 Custom context and tags

## Memory Usage

Total additional memory usage: ~448MB
- GlitchTip Web: 256MB
- PostgreSQL: 128MB  
- Redis: 64MB

Your 1GB droplet should handle this comfortably alongside existing containers.

## Testing Error Tracking

### Test Frontend Errors
```javascript
// In browser console
throw new Error("Test frontend error");
```

### Test Backend Errors
```bash
# Create a test error endpoint (temporary)
curl https://dashaway.io/api/test-error
```

## Monitoring

Check GlitchTip health:
```bash
# Check container status
docker-compose -f docker-compose.prod.yml ps

# Check GlitchTip health
curl http://localhost:8001/api/0/health/

# Check logs
docker-compose -f docker-compose.prod.yml logs glitchtip
```

## Troubleshooting

1. **Container won't start:**
   - Check memory limits: `docker stats`
   - Check logs: `docker-compose logs glitchtip`

2. **Can't access web interface:**
   - Verify port 8001 is open
   - Check firewall settings

3. **Errors not appearing:**
   - Verify DSN is set correctly
   - Check network connectivity
   - Look for console errors in browser

## Alerts Setup

1. **Email Alerts:**
   - Go to Organization Settings → Mail
   - Configure SMTP settings
   - Set up alert rules

2. **Webhook Alerts:**
   - Go to Organization Settings → Integrations
   - Add webhook URL for Slack/Discord/etc.

## Next Steps

After setup is complete:
1. Monitor error patterns for 1-2 weeks
2. Set up custom alert rules
3. Configure release tracking
4. Train team on error resolution workflow

## Security Notes

- GlitchTip runs on internal network (127.0.0.1)
- No PII is captured by default
- Use strong database passwords
- Consider IP whitelisting for admin access