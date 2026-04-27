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

from app.routes import applications

# Create the FastAPI app
app = FastAPI(
    title="OfferPath API",
    description="API for OfferPath - Job Application Tracker",
    version="1.0.0"
)

# ============================================
# CORS Configuration
# ============================================
# This allows the browser extension and frontend to talk to the API
# In production, you'd limit this to your actual domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# ============================================
# Include Routes
# ============================================
# This adds all the endpoints from applications.py
app.include_router(applications.router)


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