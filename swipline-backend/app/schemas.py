from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


# Parcel Schemas
class ContentItem(BaseModel):
    description: str
    quantity: int
    value: float


class CreateParcel(BaseModel):
    sender_name: str
    sender_email: EmailStr
    sender_phone: str
    recipient_name: str
    recipient_email: EmailStr
    recipient_phone: str
    recipient_address: str
    destination_country: str
    weight: float = Field(gt=0, le=100)
    dimensions: dict
    contents: Optional[List[ContentItem]] = None

    class Config:
        from_attributes = True


class ParcelResponse(BaseModel):
    id: str
    tracking_id: str
    sender_name: str
    sender_email: str
    status: str
    current_location: str
    border_fee: float
    border_fee_paid: bool
    estimated_delivery: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class UpdateLocation(BaseModel):
    location: str
    status: str
    description: Optional[str] = None
    coordinates: Optional[dict] = None


# Payment Schemas
class CreatePayment(BaseModel):
    tracking_id: str
    email: Optional[EmailStr] = None


class PaymentResponse(BaseModel):
    client_secret: str
    payment_id: str
    amount: float
    currency: str
    tracking_id: str


# Tracking Schemas
class TrackingHistoryResponse(BaseModel):
    status: str
    location: str
    description: Optional[str]
    created_at: datetime


class TrackingResponse(BaseModel):
    tracking_id: str
    status: str
    current_location: str
    border_fee: float
    border_fee_paid: bool
    estimated_delivery: Optional[datetime]
    history: List[TrackingHistoryResponse]


# User Schemas
class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    phone: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    created_at: datetime
