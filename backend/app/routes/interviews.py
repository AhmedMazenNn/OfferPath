"""
interviews.py
=============

API routes for interview management.

Endpoints:
- GET    /api/interviews       - List all interviews
- GET    /api/interviews/{id}  - Get single interview
- POST   /api/interviews       - Schedule new interview
- PUT    /api/interviews/{id}  - Update interview
- DELETE /api/interviews/{id}  - Cancel interview
- GET    /api/interviews/upcoming - Get upcoming interviews
"""

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, HTTPException, Query, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app.models import Interview, InterviewCreate, InterviewUpdate, InterviewResponse, Application

router = APIRouter(prefix="/api/interviews", tags=["interviews"])


@router.get("/", response_model=list[InterviewResponse])
def list_interviews(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, le=500),
    status: Optional[str] = Query(None, description="Filter by status"),
    application_id: Optional[int] = Query(None, description="Filter by application ID"),
    db: Session = Depends(get_db)
):
    """List all interviews with optional filters."""
    query = db.query(Interview)
    
    if status:
        query = query.filter(Interview.status == status)
    if application_id:
        query = query.filter(Interview.application_id == application_id)
    
    interviews = query.order_by(desc(Interview.scheduled_date)).offset(skip).limit(limit).all()
    
    result = []
    for interview in interviews:
        interview_dict = {
            "id": interview.id,
            "application_id": interview.application_id,
            "interview_type": interview.interview_type,
            "scheduled_date": interview.scheduled_date.isoformat(),
            "duration_minutes": interview.duration_minutes,
            "interviewer_name": interview.interviewer_name,
            "interviewer_email": interview.interviewer_email,
            "location": interview.location,
            "notes": interview.notes,
            "status": interview.status,
            "created_at": interview.created_at.isoformat(),
            "application_company": None,
            "application_role": None
        }
        
        application = db.query(Application).filter(Application.id == interview.application_id).first()
        if application:
            interview_dict["application_company"] = application.company
            interview_dict["application_role"] = application.role
        
        result.append(interview_dict)
    
    return result


@router.get("/upcoming", response_model=list[InterviewResponse])
def get_upcoming_interviews(
    days: int = Query(default=30, ge=1, description="Number of days to look ahead"),
    db: Session = Depends(get_db)
):
    """Get upcoming interviews within specified days."""
    from datetime import timedelta
    now = datetime.now()
    future = now + timedelta(days=days)
    
    interviews = db.query(Interview).filter(
        Interview.scheduled_date >= now,
        Interview.scheduled_date <= future,
        Interview.status == "scheduled"
    ).order_by(Interview.scheduled_date).all()
    
    result = []
    for interview in interviews:
        interview_dict = {
            "id": interview.id,
            "application_id": interview.application_id,
            "interview_type": interview.interview_type,
            "scheduled_date": interview.scheduled_date.isoformat(),
            "duration_minutes": interview.duration_minutes,
            "interviewer_name": interview.interviewer_name,
            "interviewer_email": interview.interviewer_email,
            "location": interview.location,
            "notes": interview.notes,
            "status": interview.status,
            "created_at": interview.created_at.isoformat(),
            "application_company": None,
            "application_role": None
        }
        
        application = db.query(Application).filter(Application.id == interview.application_id).first()
        if application:
            interview_dict["application_company"] = application.company
            interview_dict["application_role"] = application.role
        
        result.append(interview_dict)
    
    return result


@router.get("/{interview_id}", response_model=InterviewResponse)
def get_interview(interview_id: int, db: Session = Depends(get_db)):
    """Get a single interview by ID."""
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    result = {
        "id": interview.id,
        "application_id": interview.application_id,
        "interview_type": interview.interview_type,
        "scheduled_date": interview.scheduled_date.isoformat(),
        "duration_minutes": interview.duration_minutes,
        "interviewer_name": interview.interviewer_name,
        "interviewer_email": interview.interviewer_email,
        "location": interview.location,
        "notes": interview.notes,
        "status": interview.status,
        "created_at": interview.created_at.isoformat(),
        "application_company": None,
        "application_role": None
    }
    
    application = db.query(Application).filter(Application.id == interview.application_id).first()
    if application:
        result["application_company"] = application.company
        result["application_role"] = application.role
    
    return result


@router.post("/", response_model=InterviewResponse, status_code=201)
def create_interview(interview: InterviewCreate, db: Session = Depends(get_db)):
    """Schedule a new interview."""
    application = db.query(Application).filter(Application.id == interview.application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    from datetime import datetime
    scheduled_dt = datetime.fromisoformat(interview.scheduled_date.replace("Z", "+00:00"))
    
    db_interview = Interview(
        application_id=interview.application_id,
        interview_type=interview.interview_type,
        scheduled_date=scheduled_dt,
        duration_minutes=interview.duration_minutes,
        interviewer_name=interview.interviewer_name,
        interviewer_email=interview.interviewer_email,
        location=interview.location,
        notes=interview.notes,
        status=interview.status
    )
    
    db.add(db_interview)
    db.commit()
    db.refresh(db_interview)
    
    return {
        "id": db_interview.id,
        "application_id": db_interview.application_id,
        "interview_type": db_interview.interview_type,
        "scheduled_date": db_interview.scheduled_date.isoformat(),
        "duration_minutes": db_interview.duration_minutes,
        "interviewer_name": db_interview.interviewer_name,
        "interviewer_email": db_interview.interviewer_email,
        "location": db_interview.location,
        "notes": db_interview.notes,
        "status": db_interview.status,
        "created_at": db_interview.created_at.isoformat(),
        "application_company": application.company,
        "application_role": application.role
    }


@router.put("/{interview_id}", response_model=InterviewResponse)
def update_interview(interview_id: int, interview_update: InterviewUpdate, db: Session = Depends(get_db)):
    """Update an interview."""
    db_interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not db_interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    update_data = interview_update.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        if field == "scheduled_date" and value:
            from datetime import datetime
            setattr(db_interview, field, datetime.fromisoformat(value.replace("Z", "+00:00")))
        else:
            setattr(db_interview, field, value)
    
    db.commit()
    db.refresh(db_interview)
    
    application = db.query(Application).filter(Application.id == db_interview.application_id).first()
    
    return {
        "id": db_interview.id,
        "application_id": db_interview.application_id,
        "interview_type": db_interview.interview_type,
        "scheduled_date": db_interview.scheduled_date.isoformat(),
        "duration_minutes": db_interview.duration_minutes,
        "interviewer_name": db_interview.interviewer_name,
        "interviewer_email": db_interview.interviewer_email,
        "location": db_interview.location,
        "notes": db_interview.notes,
        "status": db_interview.status,
        "created_at": db_interview.created_at.isoformat(),
        "application_company": application.company if application else None,
        "application_role": application.role if application else None
    }


@router.delete("/{interview_id}")
def delete_interview(interview_id: int, db: Session = Depends(get_db)):
    """Cancel/delete an interview."""
    db_interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not db_interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    db.delete(db_interview)
    db.commit()
    
    return {"message": "Interview deleted successfully"}
