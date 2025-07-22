# DashAway

A modern, web-based SaaS tool for instantly cleaning and refining your writing by removing em-dashes, clichés, jargon, and common AI "tells."

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-AGPLv3-blue)
![Version](https://img.shields.io/badge/version-1.0.0-lightgrey)

## ✨ Project Overview

DashAway is a production-ready SaaS application that helps writers create cleaner, more natural-sounding content by identifying and suggesting improvements for problematic phrases, jargon, and AI-generated language patterns.

### 🎯 Target Audience
- **Content Creators & Bloggers:** Improve SEO and authenticity by avoiding AI detection
- **Students & Academics:** Produce original, natural-sounding academic writing
- **Marketing Professionals:** Polish copy and meet editorial standards efficiently
- **General Writers:** Anyone who values clear, human, and professional communication

### 🚀 Key Features
- **Real-time Text Analysis:** Instant highlighting of em-dashes, clichés, jargon, and AI tells
- **Interactive Suggestions:** Click any highlighted issue to see replacement options
- **Readability Analysis:** Flesch-Kincaid grade level scoring with complexity insights
- **User Authentication:** Full account system with JWT-based authentication
- **Three-Tier System:** Anonymous (1 use), Basic (2/month), Pro (unlimited)
- **Admin Dashboard:** Complete management interface for users and feedback
- **Usage Analytics:** Global statistics and individual usage tracking
- **Modern UI/UX:** Responsive design with dark/light theme support
- **Conversion Optimization:** Smart upgrade prompts and usage limit handling

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Authentication:** JWT with httpOnly cookies
- **Icons:** Lucide React

### Backend
- **Framework:** FastAPI with Pydantic v2
- **Language:** Python 3.11
- **Database:** PostgreSQL (Supabase)
- **ORM:** SQLAlchemy with declarative models
- **NLP Libraries:** NLTK, textstat
- **Authentication:** JWT with bcrypt password hashing

### Infrastructure
- **Containerization:** Docker with docker-compose
- **Database:** Supabase (PostgreSQL with Row Level Security)
- **Deployment Ready:** Environment-based configuration

## 🏗️ Architecture

### Database Schema
```sql
-- Users with usage tracking and monthly reset
users (id, email, hashed_password, is_active, usage_count, last_usage_reset)

-- Pro subscription management  
subscriptions (id, user_id, paddle_subscription_id, status)

-- User feedback collection
feedback (id, feedback_type, content)

-- FAQ system
faq (id, question, answer)

-- Document history (Pro feature)
document_history (id, user_id, title, content, analysis_results, created_at)

-- Global usage statistics
global_stats (id, total_texts_cleaned, total_em_dashes_found, ...)
```

### API Endpoints
```
POST /api/process          # Text analysis with authentication
POST /api/auth/register    # User registration
POST /api/auth/token       # Login with JWT
GET  /api/users/me         # Current user profile
POST /api/feedback         # Submit user feedback
GET  /api/faq             # FAQ content
GET  /api/stats/global    # Public usage statistics

# Admin endpoints (password protected)
GET  /api/admin/users     # User management
POST /api/admin/make-pro/{user_id}  # Upgrade user to Pro
GET  /api/admin/feedback  # View all feedback
```

## 🚀 Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

### Quick Start with Docker
```bash
# Clone the repository
git clone https://github.com/yourusername/dashaway.git
cd dashaway

# Create environment file
cp .env.example .env
# Edit .env with your database credentials

# Start the application
docker-compose up -d

# The application will be available at:
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
```

### Local Development Setup

1. **Backend Setup:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python download_nltk_data.py
uvicorn app.main:app --reload
```

2. **Frontend Setup:**
```bash
cd frontend
npm install
npm run dev
```

### Environment Configuration
Create a `.env` file in the root directory:
```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Authentication
JWT_SECRET=your-super-secure-jwt-secret-key
NEXTAUTH_SECRET=your-nextauth-secret

# Admin
ADMIN_PASSWORD=your-admin-password

# CORS
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com

# Frontend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📂 Project Structure

```
dashaway/
├── backend/
│   ├── app/
│   │   ├── auth/                 # Authentication system
│   │   ├── data/                 # Text analysis data files
│   │   ├── models/               # SQLAlchemy database models
│   │   ├── routes/               # FastAPI route handlers
│   │   ├── schemas/              # Pydantic models
│   │   ├── services/             # Business logic (text segmenter)
│   │   ├── utils/                # Utility functions
│   │   ├── database.py           # Database configuration
│   │   └── main.py              # FastAPI application entry
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/                  # Next.js 14 app directory
│   │   │   ├── admin/           # Admin dashboard
│   │   │   ├── dashboard/       # User dashboard
│   │   │   ├── pricing/         # Pricing page
│   │   │   ├── (auth)/          # Auth pages
│   │   │   └── (legal)/         # Legal pages
│   │   ├── contexts/            # React contexts (auth)
│   │   ├── hooks/               # Custom React hooks
│   │   └── components/          # Reusable components
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── .env                         # Environment variables
└── README.md
```

## 🔐 Authentication & User Management

### User Tiers
1. **Anonymous Users:** 1 free text analysis
2. **Basic Users:** 2 analyses per month (free account)
3. **Pro Users:** Unlimited analyses ($4/month)

### Admin Features
- Password-protected admin dashboard at `/admin`
- User management (view, make Pro, remove Pro)
- Feedback management and statistics
- FAQ population and management

## 🎨 UI/UX Features

### Modern Design System
- **Colors:** Teal to purple gradient primary, carefully chosen accent colors
- **Typography:** Inter and Poppins fonts
- **Styling:** Rounded corners (rounded-2xl), gradient buttons with hover effects
- **Themes:** Full dark/light mode support with system preference detection
- **Responsive:** Mobile-first design with Tailwind CSS

### Conversion Optimization
- **Smart CTAs:** Usage limit modals with upgrade prompts
- **Social Proof:** Live global statistics counter
- **Professional Copy:** Value-driven messaging focused on benefits
- **Smooth UX:** Loading states, error handling, and success feedback

## 🧪 Testing & Quality

### Current Test Coverage
- Manual testing of all user flows
- Authentication system verification
- Payment integration testing (ready for Paddle)
- Cross-browser compatibility testing

### Code Quality
- TypeScript for type safety
- ESLint and Prettier for code consistency
- Pydantic for API validation
- SQLAlchemy for database safety

## 🚢 Production Deployment

### Ready for Production
- ✅ Complete authentication system
- ✅ Production-grade database (Supabase)
- ✅ Docker containerization
- ✅ Environment-based configuration
- ✅ CORS and security headers
- ✅ Legal compliance (Privacy, Terms, Refund policies)
- ✅ Admin management interface
- ✅ Usage tracking and limits

### Deployment Checklist
- [ ] Domain registration and SSL
- [ ] Production hosting setup (Vercel + Railway/Render)
- [ ] Paddle payment integration
- [ ] Email service configuration
- [ ] Error monitoring (Sentry)
- [ ] Analytics integration (Google Analytics)

## 📈 Business Model

### Pricing Structure
- **Basic:** Free (2 uses/month)
- **Pro:** $4/month (unlimited usage)

### Revenue Features
- Subscription management via Paddle
- Usage-based limitations
- Upgrade conversion optimization
- Admin tools for user management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the AGPLv3 License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact & Support

- **Email:** support@dashaway.io
- **Website:** [dashaway.io](https://dashaway.io) (coming soon)
- **Issues:** [GitHub Issues](https://github.com/yourusername/dashaway/issues)

---

*DashAway - Making AI-assisted writing sound human again.* 🚀