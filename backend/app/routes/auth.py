"""
auth.py
=======

JWT Authentication for OfferPath with Access + Refresh Token support.

Endpoints:
- POST /api/auth/signup  - Register new user (with password hashing)
- POST /api/auth/login   - Login with email + password
- GET  /api/auth/me      - Get current user info
- POST /api/auth/refresh - Refresh access token using refresh token
- POST /api/auth/logout  - Invalidate refresh token
"""

from datetime import datetime, timedelta
from typing import Optional
import os
import secrets

import bcrypt
from fastapi import APIRouter, Depends, HTTPException, Security, status, Cookie, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import text
from sqlalchemy.orm import Session, defer
from jose import JWTError, jwt
from dotenv import load_dotenv

# Load environment variables
# Try to load .env from root first, then backend directory
root_env = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env")
backend_env = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")

if os.path.exists(root_env):
    load_dotenv(root_env)
elif os.path.exists(backend_env):
    load_dotenv(backend_env)
else:
    load_dotenv() # Fallback to default behavior

from app.database import get_db
from app.models import User, UserCreate, UserLogin, UserResponse, UserUpdate, TokenResponse, RefreshToken

router = APIRouter(tags=["auth"])

# ============================================
# JWT Configuration (load from .env in production)
# ============================================
SECRET_KEY = os.getenv("SECRET_KEY", "offerpath-secret-key-change-in-production")
REFRESH_SECRET_KEY = os.getenv("REFRESH_SECRET_KEY", "offerpath-refresh-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30  # 30 minutes - short-lived
REFRESH_TOKEN_EXPIRE_DAYS = 30   # 30 days - long-lived for "remember me"

security = HTTPBearer()

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT refresh token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, REFRESH_SECRET_KEY, algorithm=ALGORITHM)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash."""
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8')[:72], hashed_password.encode('utf-8'))
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt directly."""
    password_bytes = password.encode('utf-8')[:72]
    return bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode('utf-8')

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security),
    db: Session = Depends(get_db)
) -> User:
    """Dependency to get current authenticated user from access token."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type",
                headers={"WWW-Authenticate": "Bearer"},
            )
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = db.query(User).options(defer(User.avatar)).filter(User.id == int(user_id)).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user


def get_refresh_token_from_cookie(
    refresh_token: str = Cookie(None),
    x_refresh_token: str = Header(None, alias="X-Refresh-Token"),
    db: Session = Depends(get_db)
) -> RefreshToken:
    """Dependency to validate refresh token from cookie or header."""
    token = refresh_token or x_refresh_token
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token not provided",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        payload = jwt.decode(refresh_token, REFRESH_SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type",
                headers={"WWW-Authenticate": "Bearer"},
            )
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    rt = db.query(RefreshToken).filter(
        RefreshToken.token == token,
        RefreshToken.user_id == int(user_id),
        RefreshToken.expires_at > datetime.utcnow()
    ).first()
    
    if not rt:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token expired or revoked",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return rt


@router.post("/signup", response_model=dict)
def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user with password hashing."""
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    hashed_password = get_password_hash(user_data.password) if hasattr(user_data, 'password') else None
    db_user = User(
        name=user_data.name,
        email=user_data.email,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    access_token = create_access_token(data={"sub": str(db_user.id), "email": db_user.email})
    refresh_token = create_refresh_token(data={"sub": str(db_user.id), "email": db_user.email})
    
    rt = RefreshToken(
        user_id=db_user.id,
        token=refresh_token,
        expires_at=datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    )
    db.add(rt)
    db.commit()
    
    return {
        "user": {
            "id": str(db_user.id),
            "name": db_user.name,
            "email": db_user.email,
            "avatar": db_user.avatar,
            "is_admin": db_user.is_admin
        },
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }

@router.post("/login", response_model=dict)
def login(credentials: UserLogin, remember_me: bool = False, db: Session = Depends(get_db)):
    """Login user with email + password. Set remember_me for long-lived refresh token."""
    user = db.query(User).filter(User.email == credentials.email).first()
    
    if not user or not user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": str(user.id), "email": user.email})
    refresh_token = create_refresh_token(data={"sub": str(user.id), "email": user.email})
    
    expiry_days = 90 if remember_me else REFRESH_TOKEN_EXPIRE_DAYS
    
    rt = RefreshToken(
        user_id=user.id,
        token=refresh_token,
        expires_at=datetime.utcnow() + timedelta(days=expiry_days)
    )
    db.add(rt)
    db.commit()
    
    return {
        "user": {
            "id": str(user.id),
            "name": user.name,
            "email": user.email,
            "avatar": user.avatar,
            "is_admin": user.is_admin
        },
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Get current user info from token."""
    return current_user

@router.put("/me", response_model=UserResponse)
def update_me(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user profile."""
    if user_update.name is not None:
        current_user.name = user_update.name
    if user_update.avatar is not None:
        current_user.avatar = user_update.avatar
    if user_update.email is not None:
        existing = db.query(User).filter(
            User.email == user_update.email,
            User.id != current_user.id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already in use"
            )
        current_user.email = user_update.email
    
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/logout")
def logout(
    refresh_token: str = Cookie(None),
    db: Session = Depends(get_db)
):
    """Logout and invalidate refresh token."""
    if refresh_token:
        rt = db.query(RefreshToken).filter(RefreshToken.token == refresh_token).first()
        if rt:
            db.delete(rt)
            db.commit()
    return {"message": "Successfully logged out"}


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(
    rt: RefreshToken = Depends(get_refresh_token_from_cookie),
    db: Session = Depends(get_db)
):
    """Refresh the access token using refresh token from cookie."""
    user = db.query(User).options(defer(User.avatar)).filter(User.id == rt.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    access_token = create_access_token(data={"sub": str(user.id), "email": user.email})
    new_refresh_token = create_refresh_token(data={"sub": str(user.id), "email": user.email})
    
    new_rt = RefreshToken(
        user_id=user.id,
        token=new_refresh_token,
        expires_at=datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    )
    db.add(new_rt)
    
    db.delete(rt)
    db.commit()
    
    response = TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh_token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
    return response
