import os
import jwt
from typing import Optional
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from ..models.user import User
from ..database import SessionLocal

load_dotenv("/app/.env")

security = HTTPBearer()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def verify_supabase_token(token: str) -> dict:
    """Verify Supabase JWT token and return user info"""
    try:
        # Get Supabase JWT secret from environment
        jwt_secret = os.getenv("SUPABASE_JWT_SECRET")
        if not jwt_secret:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Supabase JWT secret not configured"
            )
        
        # Decode and verify the JWT token
        payload = jwt.decode(
            token,
            jwt_secret,
            algorithms=["HS256"],
            options={"verify_aud": False}  # Supabase doesn't use audience claim
        )
        
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_current_user_supabase(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get current user from Supabase JWT token"""
    token = credentials.credentials
    payload = verify_supabase_token(token)
    
    # Extract user info from JWT payload
    supabase_user_id = payload.get("sub")
    email = payload.get("email")
    
    if not supabase_user_id or not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Find user in database by email (or supabase_id if you add that column)
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        # Auto-create user if they don't exist but have valid Supabase auth
        user = User(
            email=email,
            hashed_password="",  # OAuth users don't have passwords
            usage_count=2  # Default for basic users
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    return user

def get_current_user_optional_supabase(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False)),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Get current user from Supabase JWT token, return None if not authenticated"""
    if not credentials:
        return None
    
    try:
        return get_current_user_supabase(credentials, db)
    except HTTPException:
        return None