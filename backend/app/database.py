"""
database.py
=========

This file sets up the database connection using SQLAlchemy with PostgreSQL.

The database URL is configured via environment variables (.env file).
"""

import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Load environment variables from .env file in backend directory
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(env_path)

# Build DATABASE_URL from environment variables
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "offerpath")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")

# Build the URL
password_part = f":{DB_PASSWORD}" if DB_PASSWORD else ""
DATABASE_URL = f"postgresql://{DB_USER}{password_part}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

print(f"Connecting to database: {DB_HOST}:{DB_PORT}/{DB_NAME}")

# Create the database engine
engine = create_engine(DATABASE_URL)

# Create a SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create a Base class
Base = declarative_base()


def get_db():
    """Dependency for getting database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database tables."""
    from app.models import Application, User, Interview, Offer
    Base.metadata.create_all(bind=engine)
    print("Database tables ready!")