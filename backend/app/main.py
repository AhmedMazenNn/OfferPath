"""
main.py - FastAPI Entry Point
=====================

This is the main FastAPI application file.
It sets up the server and includes all routes.

What does this file do?
1. Creates the FastAPI app
2. Configures CORS (for browser access)
3. Includes all route files
4. Defines root endpoints
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
import os
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env")
load_dotenv(env_path)

CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")

from app.routes import applications, interviews, offers, analytics, auth, admin
from app.database import engine

# Create the FastAPI app
app = FastAPI(
    title="OfferPath API",
    description="API for OfferPath - Job Application Tracker",
    version="1.0.0"
)

@app.on_event("startup")
def startup_event():
    """Create missing columns on startup."""
    try:
        with engine.connect() as conn:
            try:
                conn.execute(text("ALTER TABLE offers ADD COLUMN pros TEXT DEFAULT '[]'"))
                conn.commit()
            except Exception:
                pass
            try:
                conn.execute(text("ALTER TABLE offers ADD COLUMN cons TEXT DEFAULT '[]'"))
                conn.commit()
            except Exception:
                pass
            try:
                conn.execute(text("ALTER TABLE interviews ADD COLUMN is_remote BOOLEAN DEFAULT true"))
                conn.commit()
            except Exception:
                pass
            try:
                conn.execute(text("ALTER TABLE interviews ADD COLUMN meeting_link TEXT"))
                conn.commit()
            except Exception:
                pass
            try:
                conn.execute(text("ALTER TABLE users ADD COLUMN avatar TEXT"))
                conn.commit()
            except Exception:
                pass
    except Exception:
        pass

# ============================================
# CORS Configuration
# ============================================
# This allows the browser extension and frontend to talk to the API
# In production, you'd limit this to your actual domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# Include Routes
# ============================================
# This adds all the endpoints from route files
app.include_router(applications.router)
app.include_router(interviews.router)
app.include_router(offers.router)
app.include_router(analytics.router)
app.include_router(auth.router)
app.include_router(admin.router)


# ============================================
# Root Endpoints
# ============================================

@app.get("/")
def root():
    """
    Root URL - just returns a welcome message
    """
    return {
        "message": "Welcome to OfferPath API",
        "version": "1.0.0",
        "docs": "Visit /docs for interactive documentation"
    }


@app.get("/health")
def health_check():
    """
    Health check endpoint - for monitoring
    """
    return {"status": "healthy"}


# ============================================
# Documentation
# ============================================
# FastAPI automatically creates API docs at /docs
# You can also try /redoc for alternative docs
#
# To view:
# 1. Run the server: uvicorn app.main:app --reload
# 2. Open: http://127.0.0.1:8000/docs
# 3. You can test endpoints directly in the browser!