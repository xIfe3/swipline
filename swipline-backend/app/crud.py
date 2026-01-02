from sqlalchemy.orm import Session
from sqlalchemy import and_
from app import models, schemas
from datetime import datetime, timedelta
from typing import Optional, List


# Parcel CRUD operations
def calculate_shipping_cost(weight: float, destination: str) -> float:
    """Calculate shipping cost"""
    base_cost = 10
    weight_cost = weight * 2
    multipliers = {"US": 1.2, "UK": 1.3, "CA": 1.1, "AU": 1.5, "EU": 1.0}
    multiplier = multipliers.get(destination, 1.0)
    return (base_cost + weight_cost) * multiplier


def calculate_border_fee(destination: str) -> float:
    """Calculate border fee"""
    fees = {"US": 25, "UK": 30, "CA": 20, "AU": 35, "EU": 15}
    return fees.get(destination, 20)


def create_parcel(db: Session, parcel: schemas.CreateParcel):
    """Create a new parcel"""

    # Calculate costs
    shipping_cost = calculate_shipping_cost(parcel.weight, parcel.destination_country)
    border_fee = calculate_border_fee(parcel.destination_country)

    # Create parcel instance
    db_parcel = models.Parcel(
        **parcel.dict(),
        shipping_cost=shipping_cost,
        border_fee=border_fee,
        status="pending",
        current_location="Warehouse - Origin",
        estimated_delivery=datetime.now() + timedelta(days=7),
    )

    db.add(db_parcel)
    db.commit()
    db.refresh(db_parcel)

    # Create initial tracking history
    tracking_history = models.TrackingHistory(
        parcel_id=db_parcel.id,
        status="pending",
        location="Warehouse - Origin",
        description="Parcel registered in system",
    )

    db.add(tracking_history)
    db.commit()

    return db_parcel


def get_parcel_by_tracking_id(db: Session, tracking_id: str):
    """Get parcel by tracking ID"""
    return (
        db.query(models.Parcel).filter(models.Parcel.tracking_id == tracking_id).first()
    )


def get_parcel_by_id(db: Session, parcel_id: str):
    """Get parcel by ID"""
    return db.query(models.Parcel).filter(models.Parcel.id == parcel_id).first()


def update_parcel_location(
    db: Session, tracking_id: str, location_data: schemas.UpdateLocation
):
    """Update parcel location"""
    parcel = get_parcel_by_tracking_id(db, tracking_id)
    if not parcel:
        return None

    # Update parcel
    parcel.current_location = location_data.location
    parcel.status = location_data.status

    if location_data.coordinates:
        parcel.coordinates = location_data.coordinates

    parcel.updated_at = datetime.now()
    db.commit()
    db.refresh(parcel)

    # Add to tracking history
    tracking_history = models.TrackingHistory(
        parcel_id=parcel.id,
        status=location_data.status,
        location=location_data.location,
        description=location_data.description,
        coordinates=location_data.coordinates,
    )

    db.add(tracking_history)
    db.commit()

    return parcel


def get_tracking_history(db: Session, tracking_id: str):
    """Get tracking history for a parcel"""
    parcel = get_parcel_by_tracking_id(db, tracking_id)
    if not parcel:
        return None

    # Get tracking history
    history = (
        db.query(models.TrackingHistory)
        .filter(models.TrackingHistory.parcel_id == parcel.id)
        .order_by(models.TrackingHistory.created_at)
        .all()
    )

    return {
        "tracking_id": parcel.tracking_id,
        "status": parcel.status,
        "current_location": parcel.current_location,
        "border_fee": parcel.border_fee,
        "border_fee_paid": parcel.border_fee_paid,
        "estimated_delivery": parcel.estimated_delivery,
        "history": [
            {
                "status": h.status,
                "location": h.location,
                "description": h.description,
                "created_at": h.created_at,
            }
            for h in history
        ],
    }


def get_user_parcels(db: Session, user_id: str, skip: int = 0, limit: int = 100):
    """Get all parcels for a user"""
    return (
        db.query(models.Parcel)
        .filter(models.Parcel.user_id == user_id)
        .order_by(models.Parcel.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def search_parcels(
    db: Session,
    tracking_id: Optional[str] = None,
    status: Optional[str] = None,
    email: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
):
    """Search parcels by criteria"""
    query = db.query(models.Parcel)

    if tracking_id:
        query = query.filter(models.Parcel.tracking_id.ilike(f"%{tracking_id}%"))

    if status:
        query = query.filter(models.Parcel.status == status)

    if email:
        query = query.filter(
            (models.Parcel.sender_email.ilike(f"%{email}%"))
            | (models.Parcel.recipient_email.ilike(f"%{email}%"))
        )

    return (
        query.order_by(models.Parcel.created_at.desc()).offset(skip).limit(limit).all()
    )


# User CRUD operations
def get_user_by_email(db: Session, email: str):
    """Get user by email"""
    return db.query(models.User).filter(models.User.email == email).first()


def get_user_by_id(db: Session, user_id: str):
    """Get user by ID"""
    return db.query(models.User).filter(models.User.id == user_id).first()


def create_user(db: Session, user: schemas.UserCreate):
    """Create a new user"""
    db_user = models.User(
        email=user.email,
        full_name=user.full_name,
        password=user.password,  # Should be hashed in router
        phone=user.phone,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


# Payment CRUD operations
def create_payment(db: Session, payment_data: dict):
    """Create a payment record"""
    db_payment = models.Payment(**payment_data)
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return db_payment


def get_payment_by_id(db: Session, payment_id: str):
    """Get payment by ID"""
    return db.query(models.Payment).filter(models.Payment.id == payment_id).first()


def get_payment_by_stripe_id(db: Session, stripe_payment_id: str):
    """Get payment by Stripe ID"""
    return (
        db.query(models.Payment)
        .filter(models.Payment.payment_id == stripe_payment_id)
        .first()
    )


def update_payment_status(db: Session, payment_id: str, status: str):
    """Update payment status"""
    payment = get_payment_by_id(db, payment_id)
    if payment:
        payment.status = status
        if status == "completed":
            payment.completed_at = datetime.now()
        db.commit()
        db.refresh(payment)
    return payment


def get_parcel_payments(db: Session, parcel_id: str):
    """Get all payments for a parcel"""
    return (
        db.query(models.Payment)
        .filter(models.Payment.parcel_id == parcel_id)
        .order_by(models.Payment.created_at.desc())
        .all()
    )
