from sqlalchemy import (
    Column,
    String,
    Float,
    Boolean,
    DateTime,
    JSON,
    ForeignKey,
)
from sqlalchemy.sql import func
from app.database import Base
import uuid


def generate_uuid():
    return str(uuid.uuid4())


def generate_tracking_id():
    import random
    import string
    import datetime

    prefix = "SWP"
    random_part = "".join(random.choices(string.ascii_uppercase + string.digits, k=8))
    date_part = datetime.datetime.now().strftime("%y%m%d")
    return f"{prefix}{date_part}{random_part}"


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, nullable=False)
    full_name = Column(String, nullable=False)
    phone = Column(String)
    password = Column(String, nullable=False)
    role = Column(String, default="user")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Parcel(Base):
    __tablename__ = "parcels"

    id = Column(String, primary_key=True, default=generate_uuid)
    tracking_id = Column(String, unique=True, default=generate_tracking_id)

    # Sender info
    sender_name = Column(String, nullable=False)
    sender_email = Column(String, nullable=False)
    sender_phone = Column(String, nullable=False)

    # Recipient info
    recipient_name = Column(String, nullable=False)
    recipient_email = Column(String, nullable=False)
    recipient_phone = Column(String, nullable=False)
    recipient_address = Column(String, nullable=False)
    destination_country = Column(String, nullable=False)

    # Package details
    weight = Column(Float, nullable=False)
    dimensions = Column(
        JSON, nullable=False
    )  # {length: 30, width: 20, height: 15, unit: "cm"}

    # Tracking
    status = Column(String, default="pending")
    current_location = Column(String, default="Warehouse - Origin")
    coordinates = Column(JSON)  # {lat: 40.7128, lng: -74.0060}

    # Financial
    shipping_cost = Column(Float, default=0)
    border_fee = Column(Float, default=0)
    border_fee_paid = Column(Boolean, default=False)

    # Dates
    estimated_delivery = Column(DateTime(timezone=True))
    actual_delivery = Column(DateTime(timezone=True))

    # Relations
    user_id = Column(String, ForeignKey("users.id"), nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class TrackingHistory(Base):
    __tablename__ = "tracking_history"

    id = Column(String, primary_key=True, default=generate_uuid)
    parcel_id = Column(String, ForeignKey("parcels.id"), nullable=False)
    status = Column(String, nullable=False)
    location = Column(String, nullable=False)
    coordinates = Column(JSON)
    description = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Payment(Base):
    __tablename__ = "payments"

    id = Column(String, primary_key=True, default=generate_uuid)
    parcel_id = Column(String, ForeignKey("parcels.id"), nullable=False)
    payment_id = Column(String, unique=True, nullable=False)  # Stripe ID
    type = Column(String, nullable=False)  # border_fee, shipping_fee
    amount = Column(Float, nullable=False)
    status = Column(String, default="pending")
    payment_details = Column(JSON)
    completed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
