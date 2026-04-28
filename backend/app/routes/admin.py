"""
admin.py - Admin Panel API Routes
=================================

Admin-only endpoints for user management and system administration.
"""

from fastapi import APIRouter, Depends, HTTPException, Security, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from datetime import datetime

from app.database import get_db
from app.models import User, Application
from app.routes.auth import get_current_user, get_password_hash

router = APIRouter(prefix="/api/admin", tags=["admin"])


def require_admin(current_user: User = Depends(get_current_user)):
    """Dependency that requires the user to be an admin."""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    is_admin: bool
    created_at: str
    
    model_config = {"from_attributes": True}


class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    is_admin: bool = False


class UserStats(BaseModel):
    total_users: int
    total_applications: int
    active_today: int
    new_this_week: int


@router.get("/users", response_model=List[UserResponse])
def list_users(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Get all users (admin only)."""
    users = db.query(User).all()
    return [
        UserResponse(
            id=u.id,
            name=u.name,
            email=u.email,
            is_admin=u.is_admin,
            created_at=u.created_at.isoformat() if u.created_at else ""
        )
        for u in users
    ]


@router.post("/users", response_model=UserResponse)
def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Create a new user (admin only)."""
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    db_user = User(
        name=user_data.name,
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
        is_admin=user_data.is_admin
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return UserResponse(
        id=db_user.id,
        name=db_user.name,
        email=db_user.email,
        is_admin=db_user.is_admin,
        created_at=db_user.created_at.isoformat() if db_user.created_at else ""
    )


@router.put("/users/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    name: str | None = None,
    email: str | None = None,
    is_admin: bool | None = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Update a user (admin only)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if name is not None:
        user.name = name
    if email is not None:
        user.email = email
    if is_admin is not None:
        user.is_admin = is_admin
    
    db.commit()
    db.refresh(user)
    
    return UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        is_admin=user.is_admin,
        created_at=user.created_at.isoformat() if user.created_at else ""
    )


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Delete a user (admin only). Cannot delete yourself."""
    if admin.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete yourself"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    db.delete(user)
    db.commit()
    
    return {"message": "User deleted successfully"}


@router.get("/stats", response_model=UserStats)
def get_admin_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Get system statistics (admin only)."""
    total_users = db.query(User).count()
    total_applications = db.query(Application).count()
    
    now = datetime.now()
    week_ago = now.replace(day=now.day - 7 if now.day > 7 else 1)
    new_this_week = db.query(User).filter(User.created_at >= week_ago).count()
    
    return UserStats(
        total_users=total_users,
        total_applications=total_applications,
        active_today=0,
        new_this_week=new_this_week
    )


@router.get("/applications")
def get_all_applications(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Get all applications with user info (admin only)."""
    apps = db.query(Application).offset(skip).limit(limit).all()
    result = []
    for app in apps:
        result.append({
            "id": app.id,
            "company": app.company,
            "role": app.role,
            "status": app.status,
            "applied_date": app.applied_date.isoformat() if app.applied_date else None,
            "user_id": app.user_id,
            "user_name": app.user.name if app.user else None,
            "user_email": app.user.email if app.user else None,
        })
    return result


@router.delete("/applications/{application_id}")
def delete_application_admin(
    application_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Delete any application (admin only)."""
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    db.delete(app)
    db.commit()
    
    return {"message": "Application deleted successfully"}