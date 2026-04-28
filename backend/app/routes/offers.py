"""
offers.py
=========

API routes for job offer management.

Endpoints:
- GET    /api/offers           - List all offers
- GET    /api/offers/{id}      - Get single offer
- POST   /api/offers           - Create new offer
- PUT    /api/offers/{id}      - Update offer
- DELETE /api/offers/{id}      - Delete offer
- GET    /api/offers/compare   - Compare multiple offers
"""

from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app.models import Offer, OfferCreate, OfferUpdate, OfferResponse, Application

router = APIRouter(prefix="/api/offers", tags=["offers"])


@router.get("/", response_model=list[OfferResponse])
def list_offers(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, le=500),
    status: Optional[str] = Query(None, description="Filter by status"),
    application_id: Optional[int] = Query(None, description="Filter by application ID"),
    db: Session = Depends(get_db)
):
    """List all offers with optional filters."""
    query = db.query(Offer)
    
    if status:
        query = query.filter(Offer.status == status)
    if application_id:
        query = query.filter(Offer.application_id == application_id)
    
    offers = query.order_by(desc(Offer.created_at)).offset(skip).limit(limit).all()
    
    result = []
    for offer in offers:
        offer_dict = {
            "id": offer.id,
            "application_id": offer.application_id,
            "base_salary": offer.base_salary,
            "currency": offer.currency,
            "bonus": offer.bonus,
            "equity": offer.equity,
            "benefits": offer.benefits.split(",") if offer.benefits and offer.benefits != "[]" else [],
            "start_date": offer.start_date.isoformat() if offer.start_date else None,
            "deadline": offer.deadline.isoformat() if offer.deadline else None,
            "status": offer.status,
            "notes": offer.notes,
            "created_at": offer.created_at.isoformat(),
            "application_company": None,
            "application_role": None
        }
        
        application = db.query(Application).filter(Application.id == offer.application_id).first()
        if application:
            offer_dict["application_company"] = application.company
            offer_dict["application_role"] = application.role
        
        result.append(offer_dict)
    
    return result


@router.get("/compare", response_model=list[OfferResponse])
def compare_offers(
    offer_ids: List[int] = Query(..., description="List of offer IDs to compare"),
    db: Session = Depends(get_db)
):
    """Compare multiple offers side-by-side."""
    if len(offer_ids) < 2:
        raise HTTPException(status_code=400, detail="At least 2 offer IDs required for comparison")
    
    offers = db.query(Offer).filter(Offer.id.in_(offer_ids)).all()
    
    if len(offers) != len(offer_ids):
        raise HTTPException(status_code=404, detail="One or more offers not found")
    
    result = []
    for offer in offers:
        offer_dict = {
            "id": offer.id,
            "application_id": offer.application_id,
            "base_salary": offer.base_salary,
            "currency": offer.currency,
            "bonus": offer.bonus,
            "equity": offer.equity,
            "benefits": offer.benefits.split(",") if offer.benefits and offer.benefits != "[]" else [],
            "start_date": offer.start_date.isoformat() if offer.start_date else None,
            "deadline": offer.deadline.isoformat() if offer.deadline else None,
            "status": offer.status,
            "notes": offer.notes,
            "created_at": offer.created_at.isoformat(),
            "application_company": None,
            "application_role": None
        }
        
        application = db.query(Application).filter(Application.id == offer.application_id).first()
        if application:
            offer_dict["application_company"] = application.company
            offer_dict["application_role"] = application.role
        
        result.append(offer_dict)
    
    return result


@router.get("/{offer_id}", response_model=OfferResponse)
def get_offer(offer_id: int, db: Session = Depends(get_db)):
    """Get a single offer by ID."""
    offer = db.query(Offer).filter(Offer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    
    result = {
        "id": offer.id,
        "application_id": offer.application_id,
        "base_salary": offer.base_salary,
        "currency": offer.currency,
        "bonus": offer.bonus,
        "equity": offer.equity,
        "benefits": offer.benefits.split(",") if offer.benefits and offer.benefits != "[]" else [],
        "start_date": offer.start_date.isoformat() if offer.start_date else None,
        "deadline": offer.deadline.isoformat() if offer.deadline else None,
        "status": offer.status,
        "notes": offer.notes,
        "created_at": offer.created_at.isoformat(),
        "application_company": None,
        "application_role": None
    }
    
    application = db.query(Application).filter(Application.id == offer.application_id).first()
    if application:
        result["application_company"] = application.company
        result["application_role"] = application.role
    
    return result


@router.post("/", response_model=OfferResponse, status_code=201)
def create_offer(offer: OfferCreate, db: Session = Depends(get_db)):
    """Create a new job offer."""
    application = db.query(Application).filter(Application.id == offer.application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    from datetime import date
    start_date = date.fromisoformat(offer.start_date) if offer.start_date else None
    deadline = date.fromisoformat(offer.deadline) if offer.deadline else None
    benefits_str = ",".join(offer.benefits) if offer.benefits else "[]"
    
    db_offer = Offer(
        application_id=offer.application_id,
        base_salary=offer.base_salary,
        currency=offer.currency,
        bonus=offer.bonus,
        equity=offer.equity,
        benefits=benefits_str,
        start_date=start_date,
        deadline=deadline,
        status=offer.status,
        notes=offer.notes
    )
    
    db.add(db_offer)
    db.commit()
    db.refresh(db_offer)
    
    return {
        "id": db_offer.id,
        "application_id": db_offer.application_id,
        "base_salary": db_offer.base_salary,
        "currency": db_offer.currency,
        "bonus": db_offer.bonus,
        "equity": db_offer.equity,
        "benefits": offer.benefits,
        "start_date": db_offer.start_date.isoformat() if db_offer.start_date else None,
        "deadline": db_offer.deadline.isoformat() if db_offer.deadline else None,
        "status": db_offer.status,
        "notes": db_offer.notes,
        "created_at": db_offer.created_at.isoformat(),
        "application_company": application.company,
        "application_role": application.role
    }


@router.put("/{offer_id}", response_model=OfferResponse)
def update_offer(offer_id: int, offer_update: OfferUpdate, db: Session = Depends(get_db)):
    """Update an offer."""
    db_offer = db.query(Offer).filter(Offer.id == offer_id).first()
    if not db_offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    
    update_data = offer_update.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        if field in ["start_date", "deadline"] and value:
            from datetime import date
            setattr(db_offer, field, date.fromisoformat(value))
        elif field == "benefits" and value is not None:
            setattr(db_offer, "benefits", ",".join(value))
        else:
            setattr(db_offer, field, value)
    
    db.commit()
    db.refresh(db_offer)
    
    application = db.query(Application).filter(Application.id == db_offer.application_id).first()
    benefits_list = db_offer.benefits.split(",") if db_offer.benefits and db_offer.benefits != "[]" else []
    
    return {
        "id": db_offer.id,
        "application_id": db_offer.application_id,
        "base_salary": db_offer.base_salary,
        "currency": db_offer.currency,
        "bonus": db_offer.bonus,
        "equity": db_offer.equity,
        "benefits": benefits_list,
        "start_date": db_offer.start_date.isoformat() if db_offer.start_date else None,
        "deadline": db_offer.deadline.isoformat() if db_offer.deadline else None,
        "status": db_offer.status,
        "notes": db_offer.notes,
        "created_at": db_offer.created_at.isoformat(),
        "application_company": application.company if application else None,
        "application_role": application.role if application else None
    }


@router.delete("/{offer_id}")
def delete_offer(offer_id: int, db: Session = Depends(get_db)):
    """Delete an offer."""
    db_offer = db.query(Offer).filter(Offer.id == offer_id).first()
    if not db_offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    
    db.delete(db_offer)
    db.commit()
    
    return {"message": "Offer deleted successfully"}
