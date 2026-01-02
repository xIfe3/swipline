from fastapi import APIRouter, Depends, HTTPException, Header, Request
from sqlalchemy.orm import Session
import stripe
import os
from datetime import datetime
from typing import Optional

from app import schemas, crud, models
from app.database import get_db

router = APIRouter()

# Initialize Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "sk_test_...")


@router.post("/border", response_model=schemas.PaymentResponse)
def create_border_payment(
    payment: schemas.CreatePayment, db: Session = Depends(get_db)
):
    """Create border payment intent"""

    # Get parcel
    parcel = crud.get_parcel_by_tracking_id(db, payment.tracking_id)
    if not parcel:
        raise HTTPException(status_code=404, detail="Parcel not found")

    if parcel.border_fee_paid:
        raise HTTPException(status_code=400, detail="Border fee already paid")

    if parcel.status != "at_border":
        raise HTTPException(status_code=400, detail="Parcel is not at border yet")

    # Create Stripe payment intent
    try:
        payment_intent = stripe.PaymentIntent.create(
            amount=int(parcel.border_fee * 100),  # Convert to cents
            currency="usd",
            metadata={
                "parcel_id": parcel.id,
                "tracking_id": parcel.tracking_id,
                "type": "border_fee",
            },
            description=f"Border fee for {parcel.tracking_id}",
            automatic_payment_methods={
                "enabled": True,
            },
        )

        # Create payment record
        db_payment = models.Payment(
            parcel_id=parcel.id,
            payment_id=payment_intent.id,
            type="border_fee",
            amount=parcel.border_fee,
            status="pending",
            payment_details={
                "email": payment.email or parcel.sender_email,
                "method": "card",
            },
        )

        db.add(db_payment)
        db.commit()

        return {
            "client_secret": payment_intent.client_secret,
            "payment_id": db_payment.id,
            "amount": parcel.border_fee,
            "currency": "usd",
            "tracking_id": parcel.tracking_id,
        }

    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    """Handle Stripe webhook events"""

    payload = await request.body()
    webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET", "whsec_...")

    try:
        event = stripe.Webhook.construct_event(
            payload, stripe_signature, webhook_secret
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid payload: {str(e)}")
    except stripe.error.SignatureVerificationError as e:
        raise HTTPException(status_code=400, detail=f"Invalid signature: {str(e)}")

    # Handle the event
    if event.type == "payment_intent.succeeded":
        payment_intent = event.data.object
        await handle_payment_success(db, payment_intent)
    elif event.type == "payment_intent.payment_failed":
        payment_intent = event.data.object
        await handle_payment_failure(db, payment_intent)

    return {"status": "success"}


async def handle_payment_success(db: Session, payment_intent):
    """Handle successful payment"""
    # Find payment in database
    payment = (
        db.query(models.Payment)
        .filter(models.Payment.payment_id == payment_intent.id)
        .first()
    )

    if payment:
        # Update payment
        payment.status = "completed"
        payment.completed_at = datetime.now()

        # Update payment details from Stripe
        if payment_intent.charges and len(payment_intent.charges.data) > 0:
            charge = payment_intent.charges.data[0]
            if charge.payment_method_details.card:
                payment.payment_details = {
                    **payment.payment_details,
                    "card_last4": charge.payment_method_details.card.last4,
                    "card_brand": charge.payment_method_details.card.brand,
                }

        # Update parcel if it's a border fee
        if payment.type == "border_fee":
            parcel = (
                db.query(models.Parcel)
                .filter(models.Parcel.id == payment.parcel_id)
                .first()
            )

            if parcel:
                parcel.border_fee_paid = True
                parcel.status = "border_cleared"

                # Add tracking history
                tracking = models.TrackingHistory(
                    parcel_id=parcel.id,
                    status="border_cleared",
                    location=parcel.current_location,
                    description="Border fee paid and cleared customs",
                )
                db.add(tracking)

        db.commit()


async def handle_payment_failure(db: Session, payment_intent):
    """Handle failed payment"""
    payment = (
        db.query(models.Payment)
        .filter(models.Payment.payment_id == payment_intent.id)
        .first()
    )

    if payment:
        payment.status = "failed"
        db.commit()


@router.get("/{payment_id}")
def get_payment_status(payment_id: str, db: Session = Depends(get_db)):
    """Get payment status"""
    payment = db.query(models.Payment).filter(models.Payment.id == payment_id).first()

    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    return payment
