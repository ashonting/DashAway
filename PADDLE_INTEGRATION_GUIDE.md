# 🚀 DashAway Paddle Integration Guide

## Overview
This guide covers the complete Paddle billing integration for DashAway, including setup, testing, and deployment.

## 📋 What's Been Implemented

### Backend Components
- ✅ **Paddle Service** (`backend/app/services/paddle_service.py`)
  - Checkout session creation
  - Webhook processing
  - Subscription management
  - Customer management

- ✅ **Database Models** Updated
  - Enhanced User model with Paddle fields
  - Comprehensive Subscription model
  - Migration script included

- ✅ **API Routes** (`backend/app/routes/paddle.py`)
  - `POST /api/paddle/create-checkout` - Create checkout sessions
  - `GET /api/paddle/subscription-info` - Get user subscription details
  - `POST /api/paddle/cancel-subscription` - Cancel subscriptions
  - `POST /api/paddle/webhook` - Handle Paddle webhooks
  - `GET /api/paddle/pricing-config` - Get pricing information

- ✅ **Schemas** (`backend/app/schemas/paddle.py`)
  - Pydantic models for all Paddle operations
  - Type safety and validation

### Frontend Components
- ✅ **Paddle Service** (`frontend/src/services/paddleService.ts`)
  - API integration layer
  - Error handling
  - Type definitions

- ✅ **Subscription Hook** (`frontend/src/hooks/useSubscription.ts`)
  - React hook for subscription management
  - Loading states and error handling
  - Real-time subscription info

- ✅ **Enhanced Pricing Page** (`frontend/src/app/pricing/page.tsx`)
  - Dynamic pricing from backend
  - Monthly/yearly toggle
  - Real-time checkout integration
  - Loading states and error handling

## 🔧 Setup Instructions

### 1. Paddle Account Setup
1. Create a Paddle account at https://paddle.com
2. Set up your products in Paddle Dashboard:
   - **Pro Plan**: Create monthly and yearly prices
   - **Premium Plan**: Create monthly and yearly prices
3. Configure webhook endpoints:
   - Webhook URL: `https://dashaway.io/api/paddle/webhook`
   - Events to subscribe to:
     - `subscription.created`
     - `subscription.updated` 
     - `subscription.cancelled`
     - `transaction.completed`
     - `transaction.payment_failed`

### 2. Environment Variables
Add these to your `.env` files:

```bash
# Paddle Configuration
PADDLE_API_KEY=your-paddle-api-key-here
PADDLE_WEBHOOK_SECRET=your-paddle-webhook-secret-here
PADDLE_VENDOR_ID=your-paddle-vendor-id-here

# Product/Price IDs from Paddle Dashboard
PADDLE_PRO_PRODUCT_ID=your-pro-product-id-here
PADDLE_PRO_MONTHLY_PRICE_ID=your-pro-monthly-price-id-here
PADDLE_PRO_YEARLY_PRICE_ID=your-pro-yearly-price-id-here
PADDLE_PREMIUM_PRODUCT_ID=your-premium-product-id-here
PADDLE_PREMIUM_MONTHLY_PRICE_ID=your-premium-monthly-price-id-here
PADDLE_PREMIUM_YEARLY_PRICE_ID=your-premium-yearly-price-id-here
```

### 3. Database Migration
Run the migration script to update your database:

```bash
cd backend
python migrate_paddle_integration.py
```

### 4. Dependencies
Install the new Python package:

```bash
cd backend
pip install paddle-billing==1.4.1
```

## 🧪 Testing

### Local Testing
1. Use Paddle Sandbox environment (automatically configured for development)
2. Create test products and prices in Paddle Sandbox
3. Test checkout flow end-to-end
4. Verify webhook processing with ngrok or similar

### Webhook Testing
```bash
# Use ngrok to expose local server for webhook testing
ngrok http 8000

# Configure webhook URL in Paddle Dashboard:
# https://your-ngrok-url.ngrok.io/api/paddle/webhook
```

## 🚀 Deployment to Production

### 1. Update Server Files
Copy these files to your server:

```bash
# Backend files
scp backend/requirements.txt root@209.97.145.242:/var/www/DashAway/backend/
scp backend/app/services/paddle_service.py root@209.97.145.242:/var/www/DashAway/backend/app/services/
scp backend/app/schemas/paddle.py root@209.97.145.242:/var/www/DashAway/backend/app/schemas/
scp backend/app/routes/paddle.py root@209.97.145.242:/var/www/DashAway/backend/app/routes/
scp backend/app/models/user.py root@209.97.145.242:/var/www/DashAway/backend/app/models/
scp backend/app/models/subscription.py root@209.97.145.242:/var/www/DashAway/backend/app/models/
scp backend/migrate_paddle_integration.py root@209.97.145.242:/var/www/DashAway/backend/

# Frontend files
scp frontend/src/services/paddleService.ts root@209.97.145.242:/var/www/DashAway/frontend/src/services/
scp frontend/src/hooks/useSubscription.ts root@209.97.145.242:/var/www/DashAway/frontend/src/hooks/
scp frontend/src/app/pricing/page.tsx root@209.97.145.242:/var/www/DashAway/frontend/src/app/pricing/
```

### 2. Update Environment Variables
Add Paddle environment variables to your production `.env` files using the templates in `PRODUCTION-ENV-FILES.md`.

### 3. Run Migration
```bash
ssh root@209.97.145.242
cd /var/www/DashAway/backend
python migrate_paddle_integration.py
```

### 4. Restart Services
```bash
cd /var/www/DashAway
docker-compose down
docker-compose up --build -d
```

## 📊 Usage Monitoring

### User Subscription Status
The system tracks:
- Subscription tier (free, pro, premium)
- Usage limits and current usage
- Billing cycle and renewal dates
- Cancellation status

### Dashboard Integration
The dashboard will automatically:
- Show current subscription status
- Display usage limits and progress
- Provide upgrade/downgrade options
- Handle subscription management

## 🛠 Key Features

### Subscription Management
- **Flexible Plans**: Monthly and yearly billing
- **Usage Tracking**: Per-user usage limits and monitoring  
- **Graceful Degradation**: Free tier with limited usage
- **Cancellation**: Both immediate and end-of-period options

### Security
- **Webhook Verification**: HMAC signature validation
- **Authentication**: Supabase integration for user management
- **Input Validation**: Pydantic schemas for all API operations

### Error Handling
- **Comprehensive Logging**: All operations logged for debugging
- **Graceful Failures**: Fallback pricing and error states
- **User Feedback**: Clear error messages and loading states

## 🔍 Troubleshooting

### Common Issues
1. **Environment Variables**: Ensure all Paddle variables are set
2. **Database Migration**: Run migration script if database errors occur
3. **Webhook Signatures**: Verify webhook secret matches Paddle dashboard
4. **Product IDs**: Ensure price IDs match your Paddle products

### Debug Commands
```bash
# Check subscription info for a user
curl -H "Authorization: Bearer <token>" https://dashaway.io/api/paddle/subscription-info

# Test pricing config endpoint
curl https://dashaway.io/api/paddle/pricing-config

# Check webhook logs
docker-compose logs backend | grep paddle
```

## 📈 Analytics & Monitoring

The integration provides comprehensive tracking:
- Subscription creation and cancellation events
- Usage patterns and limits
- Revenue tracking through Paddle dashboard
- User lifecycle management

## 🎯 Next Steps

After deployment:
1. **Test Production Flow**: Complete end-to-end subscription test
2. **Monitor Webhooks**: Ensure all webhook events are processed
3. **User Communication**: Set up email notifications for billing events
4. **Analytics Setup**: Configure subscription analytics dashboard
5. **Support Documentation**: Create user guides for subscription management

Your Paddle integration is now complete and production-ready! 🚀