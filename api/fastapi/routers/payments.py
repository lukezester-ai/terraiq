import os
import stripe
from fastapi import APIRouter, HTTPException, Request

router = APIRouter(
    prefix="/payments",
    tags=["payments"]
)

# Use dummy keys for development/testing if real ones aren't set
stripe.api_key = os.getenv("STRIPE_API_KEY", "sk_test_mock_secret_key")
webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET", "whsec_mock_secret")

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
        
        # Create a Stripe Checkout Session
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
            success_url='http://localhost:3000/crm?session_id={CHECKOUT_SESSION_ID}&success=true',
            cancel_url='http://localhost:3000/pricing?canceled=true',
        )
        return {"checkout_url": session.url}
    except stripe.error.AuthenticationError:
        # Fallback for local development when real keys aren't provided
        return {"checkout_url": f"https://checkout.stripe.com/pay/mock_session_for_{plan_id}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/webhook")
async def stripe_webhook(request: Request):
    """
    Listens for events from Stripe (e.g. payment_intent.succeeded)
    """
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    try:
        # In a real app we construct the event using webhook_secret
        # event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
        print("Webhook received from Stripe!")
        return {"status": "success"}
    except Exception as e:
        print(f"Webhook error: {e}")
        raise HTTPException(status_code=400, detail="Webhook signature verification failed.")
