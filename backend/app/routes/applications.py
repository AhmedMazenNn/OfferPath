"""
applications.py - API Routes
=======================

This file contains all the API endpoints for job applications.

What are routes?
- They define what happens when someone visits a URL
- Like pages in a website, but for API requests

HTTP Methods:
- GET    - Read data
- POST   - Create new data
- PUT    - Update data
- DELETE - Remove data
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import json
from datetime import datetime

from app.database import get_db, init_db
from app.models import Application, ApplicationCreate, ApplicationUpdate, ApplicationResponse, User
from app.routes.auth import get_current_user

# Create a router
# This is like a mini FastAPI app for these routes
router = APIRouter(prefix="/api/applications", tags=["applications"])


# Initialize database on module load
# This ensures tables exist when we start the server
init_db()


# ============================================
# GET /api/applications
# Read all applications
# ============================================
@router.get("", response_model=List[ApplicationResponse])
def get_applications(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all job applications for the current user.
    """
    applications = db.query(Application).filter(
        Application.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    return applications


# ============================================
# GET /api/applications/{id}
# Read single application
# ============================================
@router.get("/{application_id}", response_model=ApplicationResponse)
def get_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a single application by its ID.
    
    Returns 404 if not found.
    """
    application = db.query(Application).filter(
        Application.id == application_id,
        Application.user_id == current_user.id
    ).first()
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application with id {application_id} not found"
        )
    return application


# ============================================
# POST /api/applications
# Create new application
# ============================================
@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def create_application(
    application: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new job application.
    
    Send JSON with:
    - company (required)
    - role (required)
    - job_url (optional)
    - source (optional)
    - applied_date (required)
    - etc.
    
    Returns the created application with its new ID.
    """
    custom_stages_str = ','.join(application.custom_stages) if application.custom_stages else "Applied,Screening,Phone Screen,Technical,Onsite,Offer"
    
    db_application = Application(
        user_id=current_user.id,
        company=application.company,
        role=application.role,
        job_url=application.job_url,
        source=application.source,
        applied_date=datetime.strptime(application.applied_date, "%Y-%m-%d").date(),
        status=application.status,
        notes=application.notes,
        salary=application.salary,
        location=application.location,
        current_stage_index=application.current_stage_index,
        custom_stages=custom_stages_str,
        timeline=json.dumps([{
            "stage": application.custom_stages[0] if application.custom_stages else "Applied",
            "date": datetime.now().isoformat(),
            "notes": "Application created"
        }])
    )
    
    db.add(db_application)
    db.commit()
    db.refresh(db_application)
    
    return db_application


# ============================================
# PUT /api/applications/{id}
# Update application
# ============================================
@router.put("/{application_id}", response_model=ApplicationResponse)
def update_application(
    application_id: int,
    updates: ApplicationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update an existing application.
    
    Only include fields that were provided.
    Returns 404 if not found.
    """
    application = db.query(Application).filter(
        Application.id == application_id,
        Application.user_id == current_user.id
    ).first()
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application with id {application_id} not found"
        )
    
    update_data = updates.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        if value is not None:
            if field == 'custom_stages' and isinstance(value, list):
                setattr(application, field, ','.join(value))
            elif field == 'timeline' and isinstance(value, list):
                setattr(application, field, json.dumps(value))
            else:
                setattr(application, field, value)
    
    application.last_updated = datetime.now()
    
    db.commit()
    db.refresh(application)
    
    return application


# ============================================
# DELETE /api/applications/{id}
# Delete application
# ============================================
@router.delete("/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete an application.
    
    Returns 404 if not found.
    Returns 204 (No Content) on success.
    """
    application = db.query(Application).filter(
        Application.id == application_id,
        Application.user_id == current_user.id
    ).first()
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application with id {application_id} not found"
        )
    
    db.delete(application)
    db.commit()
    
    return None


# ============================================
# Additional useful endpoints
# ============================================

@router.get("/stats/summary")
def get_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get summary statistics for current user.
    
    Returns counts by status - useful for dashboard!
    """
    query = db.query(Application).filter(Application.user_id == current_user.id)
    total = query.count()
    applied = query.filter(Application.status == "applied").count()
    screening = query.filter(Application.status == "screening").count()
    interview = query.filter(Application.status == "interview").count()
    offer = query.filter(Application.status == "offer").count()
    rejected = query.filter(Application.status == "rejected").count()
    
    return {
        "total": total,
        "applied": applied,
        "screening": screening,
        "interview": interview,
        "offer": offer,
        "rejected": rejected
    }