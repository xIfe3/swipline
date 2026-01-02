from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


# Enums
class ParcelStatus(str, Enum):
    PENDING = "pending"
    COLLECTED = "collected"
    IN_TRANSIT = "in_transit"
    AT_BORDER = "at_border"
    BORDER_CLEARED = "border_cleared"
    OUT_FOR_DELIVERY = "out_for_delivery"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class PaymentType(str, Enum):
    BORDER_FEE = "border_fee"
    SHIPPING_FEE = "shipping_fee"
    TAX = "tax"


class PaymentStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"


# Shared schemas
class Coordinates(BaseModel):
    lat: float = Field(ge=-90, le=90)
    lng: float = Field(ge=-180, le=180)


class ContentItem(BaseModel):
    description: str
    quantity: int = Field(ge=1)
    value: float = Field(ge=0)


class Dimensions(BaseModel):
    length: float = Field(gt=0)
    width: float = Field(gt=0)
    height: float = Field(gt=0)
    unit: str = Field(pattern="^(cm|in)$")


# Parcel schemas
class CreateParcel(BaseModel):
    sender_name: str = Field(min_length=2, max_length=100)
    sender_email: EmailStr
    sender_phone: str = Field(min_length=10, max_length=20)
    sender_address: Optional[str] = None

    recipient_name: str = Field(min_length=2, max_length=100)
    recipient_email: EmailStr
    recipient_phone: str = Field(min_length=10, max_length=20)
    recipient_address: str
    destination_country: str = Field(min_length=2, max_length=10)

    weight: float = Field(gt=0.01, le=100, description="Weight in kilograms")
    dimensions: Dimensions
    contents: Optional[List[ContentItem]] = None

    @validator("sender_phone", "recipient_phone")
    def validate_phone(cls, v):
        # Simple phone validation - you can enhance this
        if not v.replace("+", "").replace(" ", "").replace("-", "").isdigit():
            raise ValueError(
                "Phone number must contain only digits and allowed symbols"
            )
        return v


class ParcelResponse(BaseModel):
    id: str
    tracking_id: str
    sender_name: str
    sender_email: str
    sender_phone: str
    recipient_name: str
    recipient_email: str
    recipient_phone: str
    recipient_address: str
    destination_country: str
    weight: float
    dimensions: Dict[str, Any]
    contents: Optional[List[Dict[str, Any]]]
    status: str
    current_location: str
    coordinates: Optional[Dict[str, float]]
    shipping_cost: float
    border_fee: float
    border_fee_paid: bool
    estimated_delivery: Optional[datetime]
    actual_delivery: Optional[datetime]
    created_at: datetime
    updated_at: Optional[datetime]


class UpdateLocation(BaseModel):
    location: str
    status: ParcelStatus
    description: Optional[str] = None
    coordinates: Optional[Coordinates] = None


# Payment schemas
class CreatePayment(BaseModel):
    tracking_id: str
    email: Optional[EmailStr] = None


class PaymentResponse(BaseModel):
    client_secret: str
    payment_id: str
    amount: float
    currency: str
    tracking_id: str


class WebhookResponse(BaseModel):
    status: str
    event_type: Optional[str] = None


# Tracking schemas
class TrackingHistoryResponse(BaseModel):
    id: str
    status: str
    location: str
    description: Optional[str]
    coordinates: Optional[Dict[str, float]]
    created_at: datetime


class TrackingResponse(BaseModel):
    tracking_id: str
    status: str
    current_location: str
    coordinates: Optional[Dict[str, float]]
    border_fee: float
    border_fee_paid: bool
    estimated_delivery: Optional[datetime]
    history: List[TrackingHistoryResponse]


# User schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=2, max_length=100)


class UserCreate(UserBase):
    password: str = Field(min_length=6)
    phone: Optional[str] = None
    address: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(UserBase):
    id: str
    role: str
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    user_id: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None


# Admin schemas
class ParcelSearch(BaseModel):
    tracking_id: Optional[str] = None
    status: Optional[ParcelStatus] = None
    email: Optional[EmailStr] = None
    skip: int = 0
    limit: int = 100


class StatisticsResponse(BaseModel):
    total_parcels: int
    pending_parcels: int
    in_transit_parcels: int
    delivered_parcels: int
    total_revenue: float
    border_fee_revenue: float
    shipping_revenue: float
