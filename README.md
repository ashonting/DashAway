# DashAway

**"They'll never know AI wrote it."**

A production SaaS tool that transforms AI-generated content into authentic human writing by removing robotic phrases, corporate jargon, and AI "tells."

![Build Status](https://img.shields.io/badge/build-live-brightgreen)
![License](https://img.shields.io/badge/license-AGPLv3-blue)
![Version](https://img.shields.io/badge/version-2.0-lightgrey)
![Production](https://img.shields.io/badge/status-production-success)

🌐 **Live at:** [dashaway.io](https://dashaway.io)

## ✨ What DashAway Does

DashAway is a **live production SaaS** that helps users clean AI-generated content from ChatGPT, Claude, and other AI tools, making it undetectable and ready for personal or professional use.

### 🎯 Perfect For
- **Content Creators:** Transform AI drafts into authentic personal content
- **Students:** Make AI-assisted research sound original and natural  
- **Marketers:** Polish AI-generated copy to meet editorial standards
- **Business Professionals:** Clean AI content for reports, emails, and presentations
- **Anyone using AI tools:** Turn AI output into credible human writing

### 🚀 Live Features

#### **🤖 AI Content Humanization**
- **Real-time Detection:** Identifies ChatGPT, Claude, and AI-generated phrases
- **Interactive Cleaning:** Click highlighted text to see human alternatives
- **Comprehensive Analysis:** Removes em-dashes, clichés, jargon, and AI tells
- **Instant Results:** Transform content in seconds

#### **👤 Production Authentication** 
- **Supabase Integration:** Google OAuth + email/password authentication
- **User Profiles:** Complete account management and usage tracking
- **Secure Sessions:** JWT-based authentication with proper session handling

#### **💳 Live Billing System**
- **Paddle Integration:** Professional payment processing  
- **Subscription Management:** Automated billing and account upgrades
- **Usage Limits:** 2 free cleanings/month, unlimited Pro ($4/month)
- **Webhook Handling:** Real-time subscription status updates

#### **📊 Advanced Analytics**
- **Usage Tracking:** Individual and global statistics
- **Performance Metrics:** Readability scoring and improvement tracking
- **Admin Dashboard:** Complete user and subscription management

#### **🎨 Modern UI/UX**
- **Responsive Design:** Works perfectly on desktop and mobile
- **Dark/Light Themes:** System preference detection
- **Conversion Optimized:** Smart upgrade prompts and social proof
- **Professional Polish:** Tailwind CSS with carefully crafted design system

## 🛠️ Production Tech Stack

### **Live Infrastructure**
- **Frontend:** Next.js 14 deployed on Digital Ocean
- **Backend:** FastAPI on Digital Ocean droplet  
- **Database:** Supabase PostgreSQL with Row Level Security
- **Authentication:** Supabase Auth with Google OAuth
- **Payments:** Paddle (live billing integration)
- **SSL:** Let's Encrypt with automatic renewal
- **Reverse Proxy:** Nginx with production configuration

### **Frontend Stack**
- **Framework:** Next.js 14 with App Router and TypeScript
- **Styling:** Tailwind CSS with custom design system
- **Authentication:** Supabase client integration
- **State Management:** React Context + custom hooks
- **Icons:** Lucide React
- **Export:** PDF and DOCX generation

### **Backend Stack**
- **API:** FastAPI with Pydantic v2 validation
- **Database:** SQLAlchemy with Supabase PostgreSQL
- **Text Processing:** NLTK, textstat, custom segmentation
- **Authentication:** Supabase JWT verification
- **Payments:** Paddle webhook processing
- **CORS:** Production-ready security headers

### **Production Deployment**
- **Containerization:** Docker Compose with multi-stage builds
- **Environment:** Production environment variable management
- **Monitoring:** Container health checks and restart policies
- **Logging:** Structured logging with rotation
- **SSL:** Automated certificate management

## 🏗️ Architecture

### **Database Schema (Supabase)**
```sql
-- Supabase auth.users integration
users (
  id, email, usage_count, is_pro, 
  paddle_customer_id, subscription_tier, subscription_status,
  created_at, updated_at
)

-- Paddle subscription management
subscriptions (
  id, user_id, paddle_subscription_id, paddle_customer_id,
  status, tier, billing_cycle, current_period_end,
  paddle_data, created_at, updated_at
)

-- Document processing history  
document_history (
  id, user_id, title, original_content, cleaned_content,
  analysis_results, created_at
)

-- Global usage statistics
global_stats (
  id, total_texts_cleaned, total_ai_tells_found,
  total_users, date_recorded
)
```

### **Live API Endpoints**
```bash
# Core text processing
POST /api/process              # AI content analysis & cleaning

# Supabase authentication 
POST /api/users/sync          # User creation/sync with Supabase
GET  /api/users/me            # Current user profile

# Paddle billing
POST /api/paddle/create-checkout    # Subscription checkout
GET  /api/paddle/subscription-info  # User subscription status
POST /api/paddle/webhook           # Paddle webhook handler
GET  /api/paddle/pricing-config    # Current pricing

# Analytics & stats
GET  /api/stats/global        # Public usage statistics
POST /api/feedback           # User feedback collection

# Admin dashboard
GET  /api/admin/users        # User management (protected)
POST /api/admin/make-pro     # Manual user upgrades
```

## 🚀 Getting Started

### **Production Deployment**

```bash
# Clone the repository
git clone https://github.com/yourusername/dashaway.git
cd dashaway

# Set up production environment
cp .env.example .env
# Configure production values (see Environment section)

# Deploy to production server
./deploy-prod.sh
```

### **Local Development**

```bash
# Start with Docker
docker-compose up -d

# Or run locally:
cd backend && python -m uvicorn app.main:app --reload
cd frontend && npm run dev

# Available at:
# Frontend: http://localhost:3000  
# Backend: http://localhost:8000
# Docs: http://localhost:8000/docs
```

### **Environment Configuration**

**Production `.env`:**
```env
# Database (Supabase)
DATABASE_URL=postgresql://user:pass@host:port/database

# Authentication  
JWT_SECRET=your-secure-jwt-secret
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://yourdomain.com

# API Configuration
NEXT_PUBLIC_API_URL=https://yourdomain.com
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Supabase Integration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_JWT_SECRET=your-supabase-jwt-secret

# Paddle Billing (Production)
PADDLE_API_KEY=your-paddle-live-api-key
PADDLE_WEBHOOK_SECRET=your-webhook-secret
PADDLE_VENDOR_ID=your-vendor-id
PADDLE_PRO_PRODUCT_ID=your-product-id
PADDLE_PRO_MONTHLY_PRICE_ID=your-price-id

# Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD=secure-admin-password

# Environment
ENVIRONMENT=production
```

## 📂 Project Structure

```
dashaway/
├── backend/
│   ├── app/
│   │   ├── auth/                 # Supabase authentication
│   │   ├── models/               # SQLAlchemy models
│   │   ├── routes/               # FastAPI endpoints
│   │   │   ├── analysis.py       # Text processing
│   │   │   ├── auth.py          # Authentication
│   │   │   ├── users.py         # User management  
│   │   │   ├── paddle.py        # Billing integration
│   │   │   └── admin.py         # Admin dashboard
│   │   ├── services/             # Business logic
│   │   │   ├── segmenter.py     # Text analysis engine
│   │   │   └── paddle_service.py # Payment handling
│   │   └── main.py              # FastAPI app
├── frontend/
│   ├── src/
│   │   ├── app/                  # Next.js 14 app router
│   │   │   ├── dashboard/       # User dashboard
│   │   │   ├── pricing/         # Pricing & billing
│   │   │   ├── auth/            # Auth callbacks
│   │   │   └── admin/           # Admin interface
│   │   ├── contexts/            # React contexts
│   │   │   └── SupabaseAuthContext.tsx
│   │   ├── hooks/               # Custom hooks
│   │   │   ├── useTextAnalysis.ts
│   │   │   └── useSubscription.ts
│   │   └── services/            # API services
│   │       └── paddleService.ts
├── deploy-prod.sh               # Production deployment
├── docker-compose.prod.yml      # Production containers
├── nginx.conf                   # Production nginx config
└── .env                        # Environment variables
```

## 🔐 Production Authentication

### **Supabase Integration**
- **Google OAuth:** One-click authentication via Google
- **Email/Password:** Traditional registration with secure password handling
- **JWT Sessions:** Secure token-based authentication
- **Row Level Security:** Database-level access control

### **User Management**
- **Account Sync:** Automatic user creation between Supabase and backend
- **Usage Tracking:** Real-time monitoring of cleaning limits
- **Subscription Status:** Live integration with Paddle billing

## 💳 Live Billing System

### **Paddle Integration**
- **Checkout:** Hosted payment pages with tax handling
- **Webhooks:** Real-time subscription event processing
- **Management:** Automatic subscription lifecycle handling
- **Security:** Webhook signature verification

### **Pricing Tiers**
- **Basic:** $0/month - 2 AI content cleanings
- **Pro:** $4/month - Unlimited cleanings + advanced features

## 🎨 UI/UX Design System

### **Brand & Messaging**  
- **Tagline:** "They'll never know AI wrote it"
- **Value Prop:** Transform AI content into authentic human writing
- **Target:** Users of ChatGPT, Claude, and other AI tools

### **Design Elements**
- **Colors:** Teal to purple gradients with professional accents
- **Typography:** System fonts optimized for readability
- **Components:** Rounded, modern design with smooth animations
- **Responsive:** Mobile-first with perfect cross-device experience

## 📈 Production Metrics

### **Current Status**
- ✅ **Live Production:** dashaway.io fully operational
- ✅ **Payment Processing:** Paddle integration active
- ✅ **User Authentication:** Supabase OAuth working
- ✅ **SSL Security:** Let's Encrypt certificates active
- ✅ **Database:** Supabase PostgreSQL with RLS
- ✅ **Container Health:** Docker monitoring active

### **Performance**
- **Response Time:** <500ms average API response
- **Uptime:** 99.9% target with health monitoring
- **Security:** Production CORS, SSL, and authentication
- **Scalability:** Docker container architecture ready for scaling

## 🚢 Deployment & Operations

### **Production Deployment Script**
```bash
# Complete production deployment
./deploy-prod.sh
```

**Features:**
- Docker system cleanup and pruning
- No-cache container rebuilds  
- Environment variable validation
- Health check verification
- Automated rollback on failure

### **Monitoring & Maintenance**
```bash
# Check container status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Restart services
docker-compose -f docker-compose.prod.yml restart [service]

# Update deployment
git pull && ./deploy-prod.sh
```

## 🤝 Business Model

### **Revenue Streams**
- **Subscription Revenue:** $4/month Pro subscriptions
- **Conversion Optimization:** Smart upgrade prompts and usage limits
- **Target Market:** AI tool users (ChatGPT, Claude, etc.)

### **Growth Strategy**
- **SEO:** Targeting "AI detection removal" keywords  
- **Content Marketing:** Guides on using AI content ethically
- **Product-Led Growth:** Free tier with conversion to paid

## 📞 Support & Contact

- **Live Application:** [dashaway.io](https://dashaway.io)
- **Email:** support@dashaway.io
- **Status:** Production-ready SaaS platform

---

**DashAway** - *Turn AI content into authentic human writing. They'll never know AI wrote it.* 🤖➡️👤