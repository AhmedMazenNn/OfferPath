"""
analytics.py
============

API routes for analytics and metrics.

Endpoints:
- GET /api/analytics/funnel      - Conversion funnel data
- GET /api/analytics/metrics     - Key metrics summary
- GET /api/analytics/trends      - Application trends over time
"""

from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Query, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date as SQLDate

from app.database import get_db
from app.models import Application, Interview, Offer, User
from app.routes.auth import get_current_user

router = APIRouter(tags=["analytics"])


@router.get("/check")
def analytics_health_check():
    """Verify analytics routes are active."""
    return {"status": "ok", "message": "Analytics router is active"}


@router.get("/funnel")
def get_conversion_funnel(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get conversion funnel data (applied -> screening -> interview -> offer)."""
    query = db.query(Application).filter(Application.user_id == current_user.id)
    total_applications = query.count()
    screening = query.filter(Application.status == "screening").count()
    interview = query.filter(Application.status.in_(["interview", "phone screen", "technical", "onsite"])).count()
    offer = query.filter(Application.status == "offer").count()
    rejected = query.filter(Application.status == "rejected").count()
    accepted = query.filter(Application.status == "accepted").count()
    
    interview_count = db.query(Interview).join(Application).filter(Application.user_id == current_user.id).count()
    offer_count = db.query(Offer).join(Application).filter(Application.user_id == current_user.id).count()
    
    return {
        "total_applications": total_applications,
        "screening": screening,
        "interview": interview,
        "offer": offer,
        "rejected": rejected,
        "accepted": accepted,
        "total_interviews": interview_count,
        "total_offers": offer_count,
        "conversion_rates": {
            "applied_to_screening": round((screening / total_applications * 100), 2) if total_applications > 0 else 0,
            "applied_to_interview": round((interview / total_applications * 100), 2) if total_applications > 0 else 0,
            "applied_to_offer": round((offer / total_applications * 100), 2) if total_applications > 0 else 0,
            "offer_acceptance": round((accepted / offer * 100), 2) if offer > 0 else 0
        }
    }


@router.get("/metrics")
def get_metrics(
    period: Optional[str] = Query("all", description="Time period: week, month, quarter, year, all"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get key metrics for dashboard."""
    now = datetime.now()
    
    period_filters = {
        "week": now - timedelta(days=7),
        "month": now - timedelta(days=30),
        "quarter": now - timedelta(days=90),
        "year": now - timedelta(days=365),
        "all": None
    }
    
    start_date = period_filters.get(period)
    
    query = db.query(Application).filter(Application.user_id == current_user.id)
    if start_date:
        query = query.filter(Application.applied_date >= start_date)
    
    applications = query.all()
    
    total = len(applications)
    active = sum(1 for a in applications if a.status not in ["rejected", "accepted"])
    interviews_scheduled = db.query(Interview).join(Application).filter(
        Application.user_id == current_user.id,
        Interview.status == "scheduled"
    ).count()
    
    avg_salary = None
    salaries = [a.salary for a in applications if a.salary]
    if salaries:
        avg_salary = sum(salaries) / len(salaries)
    
    response_rate = 0
    responded = sum(1 for a in applications if a.status != "applied")
    if total > 0:
        response_rate = round((responded / total * 100), 2)
    
    return {
        "period": period,
        "total_applications": total,
        "active_applications": active,
        "interviews_scheduled": interviews_scheduled,
        "offers_received": db.query(Offer).join(Application).filter(Application.user_id == current_user.id).count(),
        "average_salary": round(avg_salary) if avg_salary else None,
        "response_rate": response_rate,
        "applications_by_status": {
            "applied": sum(1 for a in applications if a.status == "applied"),
            "screening": sum(1 for a in applications if a.status == "screening"),
            "interview": sum(1 for a in applications if a.status in ["interview", "phone screen", "technical", "onsite"]),
            "offer": sum(1 for a in applications if a.status == "offer"),
            "rejected": sum(1 for a in applications if a.status == "rejected"),
            "accepted": sum(1 for a in applications if a.status == "accepted")
        }
    }


@router.get("/trends")
def get_application_trends(
    days: int = Query(30, ge=7, le=365, description="Number of days to analyze"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get application trends over time."""
    from datetime import date
    
    now = datetime.now()
    start_date = now - timedelta(days=days)
    
    applications = db.query(Application).filter(
        Application.user_id == current_user.id,
        Application.applied_date >= start_date.date()
    ).all()
    
    daily_counts = {}
    for app in applications:
        day_str = app.applied_date.isoformat() if app.applied_date else None
        if day_str:
            daily_counts[day_str] = daily_counts.get(day_str, 0) + 1
    
    trend_data = [
        {"date": date_str, "count": count}
        for date_str, count in sorted(daily_counts.items())
    ]
    
    source_breakdown = {}
    for app in applications:
        source = app.source or "Unknown"
        source_breakdown[source] = source_breakdown.get(source, 0) + 1
    
    return {
        "period_days": days,
        "total_in_period": len(applications),
        "daily_trend": trend_data,
        "source_breakdown": source_breakdown,
        "average_per_day": round(len(applications) / days, 2)
    }
