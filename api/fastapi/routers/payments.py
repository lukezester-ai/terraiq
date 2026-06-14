import os

import stripe
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy import JSON, bindparam, text
from sqlalchemy.orm import Session

from dependencies import get_db

router = APIRouter()

stripe.api_key = os.getenv("STRIPE_API_KEY", "")
webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET", "")
frontend_base_url = os.getenv("FRONTEND_BASE_URL", "http://localhost:3000").rstrip("/")

PLAN_PRICE_ENV = {
    "start": "STRIPE_START_PRICE_ID",
    "business": "STRIPE_BUSINESS_PRICE_ID",
    "enterprise": "STRIPE_ENTERPRISE_PRICE_ID",
}


class CheckoutSessionRequest(BaseModel):
    plan_id: str
    customer_email: str | None = None


def _get_price_id(plan_id: str) -> str:
    env_name = PLAN_PRICE_ENV.get(plan_id)
    if not env_name:
        raise HTTPException(status_code=400, detail="Unknown subscription plan.")

    price_id = os.getenv(env_name, "").strip()
    if not price_id:
        raise HTTPException(status_code=503, detail=f"Stripe price is not configured for plan '{plan_id}'.")
    return price_id


@router.post("/create-checkout-session")
async def create_checkout_session(payload: CheckoutSessionRequest):
    """
    Create a Stripe Checkout Session for a recurring subscription tier.
    Requires STRIPE_*_PRICE_ID values created in Stripe Dashboard.
    """
    if not stripe.api_key:
        raise HTTPException(status_code=503, detail="Stripe is not configured.")

    price_id = _get_price_id(payload.plan_id)
    session_payload = {
        "mode": "subscription",
        "line_items": [{"price": price_id, "quantity": 1}],
        "success_url": f"{frontend_base_url}/crm?session_id={{CHECKOUT_SESSION_ID}}&success=true",
        "cancel_url": f"{frontend_base_url}/pricing?canceled=true",
        "allow_promotion_codes": True,
        "metadata": {"plan_id": payload.plan_id},
        "subscription_data": {"metadata": {"plan_id": payload.plan_id}},
    }
    if payload.customer_email:
        session_payload["customer_email"] = str(payload.customer_email)

    try:
        session = stripe.checkout.Session.create(**session_payload)
        return {"checkout_url": session.url}
    except stripe.error.StripeError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """Verify and store Stripe webhook events for billing reconciliation."""
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    if not webhook_secret:
        raise HTTPException(status_code=503, detail="Stripe webhook secret is not configured.")

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Webhook signature verification failed.") from exc

    statement = text(
        """
        INSERT INTO billing_events (id, event_type, payload)
        VALUES (:id, :event_type, :payload)
        ON CONFLICT (id) DO NOTHING
        """
    ).bindparams(bindparam("payload", type_=JSON))
    db.execute(
        statement,
        {
            "id": event["id"],
            "event_type": event["type"],
            "payload": event.to_dict_recursive(),
        },
    )
    return {"status": "success", "event_type": event["type"]}
