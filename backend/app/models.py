"""
models.py
=======

This file defines our data models using Pydantic.

What is Pydantic?
- A data validation library
- Makes sure our data is in the right format
- Like TypeScript types but for Python

We have TWO types of models here:
1. Pydantic models (BaseModel) - for API requests/responses
2. SQLAlchemy models - for database tables
"""

from pydantic import BaseModel, Field
from sqlalchemy import Column, String, Integer, Date, Text, Float, Boolean, DateTime
from sqlalchemy.sql import func
from app.database import Base


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
    resume_version: str | None = Field(None, description="Which resume you used")
    salary: int | None = Field(None, description="Salary if known")
    location: str | None = Field(None, description="Job location")


class ApplicationCreate(ApplicationBase):
    """
    Model for creating a new application.
    Used when POSTing to /applications
    """
    current_stage_index: int = Field(default=0, ge=0, description="Index in custom_stages")
    custom_stages: list[str] = Field(
        default=["Applied", "Screening", "Phone Screen", "Technical", "Onsite", "Offer"],
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
    resume_version: str | None = None
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
    current_stage_index: int
    custom_stages: list[str]
    timeline: list[dict]
    last_updated: str
    interview_date: str | None = None
    
    # This tells Pydantic to include config
    model_config = {"from_attributes": True}


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
    pass


class UserResponse(UserBase):
    """
    Model for user responses.
    """
    id: int
    
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
    company = Column(String(255), nullable=False)
    role = Column(String(255), nullable=False)
    job_url = Column(String(500), nullable=True)
    source = Column(String(100), default="Company Site")
    applied_date = Column(Date, nullable=False)
    status = Column(String(50), default="applied")
    last_updated = Column(DateTime, onupdate=func.now(), default=func.now())
    
    # Additional fields
    notes = Column(Text, nullable=True)
    resume_version = Column(String(50), nullable=True)
    salary = Column(Integer, nullable=True)
    location = Column(String(255), nullable=True)
    interview_date = Column(DateTime, nullable=True)
    
    # Pipeline
    current_stage_index = Column(Integer, default=0)
    custom_stages = Column(String(500), default="Applied,Screening,Phone Screen,Technical,Onsite,Offer")
    timeline = Column(Text, default="[]")  # JSON string of timeline events


class User(Base):
    """
    Database table for users.
    """
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    created_at = Column(DateTime, default=func.now())