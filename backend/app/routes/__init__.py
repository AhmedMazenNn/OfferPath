# app/routes/__init__.py
# Makes 'routes' a Python package

from app.routes import applications, interviews, offers, analytics, auth

__all__ = ["applications", "interviews", "offers", "analytics", "auth"]