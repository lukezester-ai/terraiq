import os
import stripe
from fastapi import APIRouter, HTTPException, Request

router = APIRouter()

stripe.api_key = os.getenv("STRIPE_API_KEY", "")
webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET", "")
frontend_base_url = os.getenv("FRONTEND_BASE_URL", "http://localhost:3000").rstrip("/")

@router.post("/create-checkout-session")
async def create_checkout_session(request: Request):
    """
    Creates a Stripe Checkout Session for a specific subscription tier.
    Expects JSON: {"plan_id": "start" | "business" | "enterprise"}
    """
    try:
        data = await request.json()
        plan_id = data.get("plan_id", "start")
        
        # Prices in EUR (represented in cents for Stripe)
        prices = {
            "start": 4900,      # 49.00 EUR
            "business": 14900,  # 149.00 EUR
            "enterprise": 49900 # 499.00 EUR
        }
        
        amount = prices.get(plan_id, 9900)
        
        if not stripe.api_key:
            raise HTTPException(status_code=503, detail="Stripe is not configured.")

        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'eur',
                    'product_data': {
                        'name': f'TerraIQ {plan_id.capitalize()} Subscription',
                        'description': 'AI-Native Enterprise Platform for Agriculture',
                    },
                    'unit_amount': amount,
                },
                'quantity': 1,
            }],
            mode='payment', # In real app, this would be 'subscription'
            success_url=f'{frontend_base_url}/crm?session_id={{CHECKOUT_SESSION_ID}}&success=true',
            cancel_url=f'{frontend_base_url}/pricing?canceled=true',
        )
        return {"checkout_url": session.url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/webhook")
async def stripe_webhook(request: Request):
    """
    Listens for events from Stripe (e.g. payment_intent.succeeded)
    """
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    if not webhook_secret:
        raise HTTPException(status_code=503, detail="Stripe webhook secret is not configured.")

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
        print(f"Webhook received from Stripe: {event.get('type')}")
        return {"status": "success"}
    except Exception as e:
        print(f"Webhook error: {e}")
        raise HTTPException(status_code=400, detail="Webhook signature verification failed.")
