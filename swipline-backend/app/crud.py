from sqlalchemy.orm import Session
from app import models, schemas
from datetime import datetime, timedelta


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
        **parcel.model_dump(),
        shipping_cost=shipping_cost,
        border_fee=border_fee,
        status="pending",
        current_location="Warehouse - Origin",
        estimated_delivery=datetime.now() + timedelta(days=7)
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
        "history": history,
    }
