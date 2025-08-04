import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from dotenv import load_dotenv

from .database import engine, Base
from .routes import analysis, auth, users, history, stats, paddle, admin
from .glitchtip import init_glitchtip
from .middleware.rate_limiter import api_rate_limit_middleware, analysis_rate_limit_middleware, auth_rate_limit_middleware

load_dotenv("/app/.env")

# Initialize GlitchTip error tracking
init_glitchtip()

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="DashAway API",
    description="Text cleaning and analysis API",
    version="1.0.0"
)

# Get CORS origins from environment variable
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

# Add compression middleware (first - closest to response)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Add rate limiting middleware (order matters - add before CORS)
app.middleware("http")(auth_rate_limit_middleware)
app.middleware("http")(analysis_rate_limit_middleware)
app.middleware("http")(api_rate_limit_middleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(analysis.router, prefix="/api")
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(history.router, prefix="/api/history", tags=["history"])
app.include_router(stats.router, prefix="/api/stats", tags=["stats"])
app.include_router(paddle.router, prefix="/api/paddle", tags=["paddle"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
# app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])  # Analytics route not yet implemented

@app.get("/")
def read_root():
    return {"message": "DashAway Backend is running"}

@app.get("/hello")
def hello_world():
    return {"message": "Hello from FastAPI!"}

@app.get("/faq")
def get_faq_root():
    return {"message": "FAQ endpoint - use /api/faq for actual FAQ data"}

@app.get("/health")
def health_check():
    """Health check endpoint for CI/CD and monitoring"""
    return {
        "status": "healthy",
        "service": "dashaway-backend",
        "version": "1.0.0"
    }
