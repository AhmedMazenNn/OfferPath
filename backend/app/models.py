"""
Data models for the Job Application Tracker.
Uses Pydantic for API validation and SQLAlchemy for database tables.
"""

from pydantic import BaseModel, Field, field_validator
from sqlalchemy import Column, String, Integer, Date, Text, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base
import json


# ============================================
# Pydantic Models (for API)
# ============================================

class ApplicationBase(BaseModel):
    """
    Base model with common fields.
    All other application models inherit from this.
    """
    company: str = Field(..., min_length=1, description="Company name")
    role: str = Field(..., min_length=1, description="Job title/role")
    job_url: str | None = Field(None, description="Link to job posting")
    source: str = Field(default="Company Site", description="Where did you find this job?")
    applied_date: str = Field(..., description="Date when you applied (YYYY-MM-DD)")
    status: str = Field(default="applied", description="Current status")
    notes: str | None = Field(None, description="Any notes about this application")
    salary: int | None = Field(None, description="Salary if known")
    location: str | None = Field(None, description="Job location")


class ApplicationCreate(ApplicationBase):
    """
    Model for creating a new application.
    Used when POSTing to /applications
    """
    current_stage_index: int = Field(default=0, ge=0, description="Index in custom_stages")
    custom_stages: list[str] = Field(
        default=["Applied", "Screening", "Interview", "Offer"],
        description="Custom pipeline stages"
    )


class ApplicationUpdate(BaseModel):
    """
    Model for updating an application.
    All fields are optional - only included fields get updated.
    """
    company: str | None = None
    role: str | None = None
    job_url: str | None = None
    source: str | None = None
    status: str | None = None
    notes: str | None = None
    salary: int | None = None
    location: str | None = None
    current_stage_index: int | None = None
    custom_stages: list[str] | None = None


class ApplicationResponse(ApplicationBase):
    """
    Model for API responses.
    Includes all fields returned to the client.
    """
    id: int
    current_stage_index: int | None = 0
    custom_stages: list[str] | None = None
    timeline: list[dict] | None = None
    last_updated: str | None = None
    interview_date: str | None = None
    
    model_config = {"from_attributes": True}

    @field_validator('applied_date', mode='before')
    @classmethod
    def parse_date(cls, v):
        if hasattr(v, 'strftime'):
            return v.strftime('%Y-%m-%d')
        return v

    @field_validator('last_updated', mode='before')
    @classmethod
    def parse_datetime(cls, v):
        if hasattr(v, 'isoformat'):
            return v.isoformat()
        return v

    @field_validator('interview_date', mode='before')
    @classmethod
    def parse_interview_date(cls, v):
        if hasattr(v, 'isoformat'):
            return v.isoformat()
        return v

    @field_validator('custom_stages', mode='before')
    @classmethod
    def parse_stages(cls, v):
        if isinstance(v, list):
            return v
        if isinstance(v, str):
            return [s.strip() for s in v.split(',') if s.strip()]
        return []

    @field_validator('timeline', mode='before')
    @classmethod
    def parse_timeline(cls, v):
        if isinstance(v, list):
            return v
        if isinstance(v, str):
            try:
                return json.loads(v)
            except:
                return []
        return []


class UserBase(BaseModel):
    """
    Base user model.
    """
    name: str
    email: str


class UserCreate(UserBase):
    """
    Model for creating a new user.
    """
    password: str = Field(..., min_length=6, description="User password (min 6 characters)")


class UserLogin(BaseModel):
    """
    Model for user login.
    """
    email: str = Field(..., description="User email")
    password: str = Field(..., min_length=6, description="User password")


class UserUpdate(BaseModel):
    """
    Model for updating user profile.
    """
    name: str | None = None
    email: str | None = None
    avatar: str | None = None
    password: str | None = Field(None, min_length=6, description="New password (optional)")
    is_admin: bool | None = None


class UserResponse(UserBase):
    """
    Model for user responses.
    """
    id: int
    avatar: str | None = None
    is_admin: bool = False
    
    model_config = {"from_attributes": True}


# ============================================
# SQLAlchemy Models (for Database)
# ============================================

class Application(Base):
    """
    Database table for job applications.
    
    This maps to a table called 'applications' in the database.
    Each attribute is a column.
    """
    __tablename__ = "applications"  # Table name in database
    
    # Column definitions
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    company = Column(String(255), nullable=False)
    role = Column(String(255), nullable=False)
    job_url = Column(String(500), nullable=True)
    source = Column(String(100), default="Company Site")
    applied_date = Column(Date, nullable=False)
    status = Column(String(50), default="applied")
    last_updated = Column(DateTime, onupdate=func.now(), default=func.now())
    
    # Additional fields
    notes = Column(Text, nullable=True)
    salary = Column(Integer, nullable=True)
    location = Column(String(255), nullable=True)
    interview_date = Column(DateTime, nullable=True)
    
    # Pipeline
    current_stage_index = Column(Integer, default=0)
    custom_stages = Column(String(500), default="Applied,Screening,Interview,Offer")
    timeline = Column(Text, default="[]")  # JSON string of timeline events
    
    # Relationships
    user = relationship("User", back_populates="applications")
    interviews = relationship("Interview", back_populates="application", cascade="all, delete-orphan")
    offers = relationship("Offer", back_populates="application", cascade="all, delete-orphan")


class User(Base):
    """
    Database table for users.
    """
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    avatar = Column(Text, nullable=True)
    hashed_password = Column(String(255), nullable=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    applications = relationship("Application", back_populates="user", cascade="all, delete-orphan")


# ============================================
# Interview Models
# ============================================

class InterviewBase(BaseModel):
    application_id: int = Field(..., description="Related job application ID")
    interview_type: str = Field(..., description="Type of interview (phone, technical, onsite, etc.)")
    scheduled_date: str = Field(..., description="Date and time of interview (ISO 8601)")
    duration_minutes: int = Field(default=60, ge=15, description="Duration in minutes")
    interviewer_name: str | None = Field(None, description="Name of interviewer")
    interviewer_email: str | None = Field(None, description="Email of interviewer")
    location: str | None = Field(None, description="Location or meeting link")
    is_remote: bool = Field(default=True, description="Is this interview remote (video/call)?")
    meeting_link: str | None = Field(None, description="Meeting link for remote interviews")
    notes: str | None = Field(None, description="Interview preparation notes")
    status: str = Field(default="scheduled", description="Status: scheduled, completed, cancelled")


class InterviewCreate(InterviewBase):
    pass


class InterviewUpdate(BaseModel):
    interview_type: str | None = None
    scheduled_date: str | None = None
    duration_minutes: int | None = None
    interviewer_name: str | None = None
    interviewer_email: str | None = None
    location: str | None = None
    is_remote: bool | None = None
    meeting_link: str | None = None
    notes: str | None = None
    status: str | None = None


class InterviewResponse(InterviewBase):
    id: int
    created_at: str
    application_company: str | None = None
    application_role: str | None = None
    
    model_config = {"from_attributes": True}


# ============================================
# Offer Models
# ============================================

class OfferBase(BaseModel):
    application_id: int = Field(..., description="Related job application ID")
    base_salary: int = Field(..., ge=0, description="Base salary amount")
    currency: str = Field(default="USD", description="Currency code")
    bonus: int | None = Field(None, ge=0, description="Sign-on bonus")
    equity: str | None = Field(None, description="Equity/stock options")
    benefits: list[str] = Field(default=[], description="List of benefits")
    start_date: str | None = Field(None, description="Proposed start date (YYYY-MM-DD)")
    deadline: str | None = Field(None, description="Offer deadline (YYYY-MM-DD)")
    status: str = Field(default="pending", description="Status: pending, accepted, declined, negotiating")
    notes: str | None = Field(None, description="Negotiation notes or thoughts")
    pros: list[str] = Field(default=[], description="Pros of this offer (customizable)")
    cons: list[str] = Field(default=[], description="Cons of this offer (customizable)")


class OfferCreate(OfferBase):
    pass


class OfferUpdate(BaseModel):
    base_salary: int | None = None
    currency: str | None = None
    bonus: int | None = None
    equity: str | None = None
    benefits: list[str] | None = None
    start_date: str | None = None
    deadline: str | None = None
    status: str | None = None
    notes: str | None = None
    pros: list[str] | None = None
    cons: list[str] | None = None


class OfferResponse(OfferBase):
    id: int
    created_at: str
    application_company: str | None = None
    application_role: str | None = None
    
    model_config = {"from_attributes": True}


# ============================================
# SQLAlchemy Models for Interview and Offer
# ============================================

class Interview(Base):
    __tablename__ = "interviews"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    application_id = Column(Integer, ForeignKey("applications.id"), index=True, nullable=False)
    interview_type = Column(String(100), nullable=False)
    scheduled_date = Column(DateTime, nullable=False)
    duration_minutes = Column(Integer, default=60)
    interviewer_name = Column(String(255), nullable=True)
    interviewer_email = Column(String(255), nullable=True)
    location = Column(String(500), nullable=True)
    is_remote = Column(Boolean, default=True)
    meeting_link = Column(String(500), nullable=True)
    notes = Column(Text, nullable=True)
    status = Column(String(50), default="scheduled")
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    application = relationship("Application", back_populates="interviews")


class Offer(Base):
    __tablename__ = "offers"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    application_id = Column(Integer, ForeignKey("applications.id"), index=True, nullable=False)
    base_salary = Column(Integer, nullable=False)
    currency = Column(String(10), default="USD")
    bonus = Column(Integer, nullable=True)
    equity = Column(String(255), nullable=True)
    benefits = Column(Text, default="[]")
    start_date = Column(Date, nullable=True)
    deadline = Column(Date, nullable=True)
    status = Column(String(50), default="pending")
    notes = Column(Text, nullable=True)
    pros = Column(Text, default="[]")
    cons = Column(Text, default="[]")
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    application = relationship("Application", back_populates="offers")