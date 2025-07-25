from datetime import datetime, timedelta
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer, HTTPBearer
from fastapi.security.utils import get_authorization_scheme_param

from ..database import SessionLocal
from ..models.user import User

from dotenv import load_dotenv
import os

load_dotenv("/app/.env")

SECRET_KEY = os.getenv("JWT_SECRET")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    db = SessionLocal()
    user = db.query(User).filter(User.email == username).first()
    db.close()
    
    if user is None:
        raise credentials_exception
    return user


def get_current_user_optional(request: Request) -> Optional[User]:
    """Get current user if authenticated, None if not (for anonymous usage)"""
    try:
        # Try to get token from Authorization header
        authorization = request.headers.get("Authorization")
        if authorization:
            scheme, token = get_authorization_scheme_param(authorization)
            if scheme.lower() == "bearer":
                # Use the token from Authorization header
                pass
            else:
                token = None
        else:
            token = None
        
        if not token:
            # Try to get from cookie
            token = request.cookies.get("access_token")
            if token and token.startswith("Bearer "):
                token = token[7:]  # Remove "Bearer " prefix
        
        if not token:
            return None
            
        # Validate token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            return None
            
        # Get user from database
        db = SessionLocal()
        user = db.query(User).filter(User.email == username).first()
        db.close()
        
        return user
        
    except (JWTError, AttributeError):
        return None
