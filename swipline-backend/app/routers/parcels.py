from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import schemas, crud
from app.database import get_db

router = APIRouter()


@router.post("/", response_model=schemas.ParcelResponse)
def create_parcel(parcel: schemas.CreateParcel, db: Session = Depends(get_db)):
    """Create a new parcel"""
    return crud.create_parcel(db=db, parcel=parcel)


@router.get("/{tracking_id}", response_model=schemas.ParcelResponse)
def get_parcel(tracking_id: str, db: Session = Depends(get_db)):
    """Get parcel by tracking ID"""
    parcel = crud.get_parcel_by_tracking_id(db, tracking_id)
    if not parcel:
        raise HTTPException(status_code=404, detail="Parcel not found")
    return parcel


@router.put("/{tracking_id}/location")
def update_location(
    tracking_id: str,
    location_data: schemas.UpdateLocation,
    db: Session = Depends(get_db),
):
    """Update parcel location"""
    return crud.update_parcel_location(db, tracking_id, location_data)


@router.get("/{tracking_id}/tracking", response_model=schemas.TrackingResponse)
def get_tracking_history(tracking_id: str, db: Session = Depends(get_db)):
    """Get full tracking history"""
    return crud.get_tracking_history(db, tracking_id)
