"""Create TerraIQ Stripe products and recurring prices (idempotent).

Usage:
    set STRIPE_API_KEY=sk_live_...    (or sk_test_...)
    python api/fastapi/scripts/create_stripe_pricing.py

Prints the env-var assignments to paste into Render / Vercel.
"""
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request

API_KEY = os.environ.get("STRIPE_API_KEY", "").strip()
if not API_KEY:
    print("ERROR: set STRIPE_API_KEY env var first (sk_live_... or sk_test_...)", file=sys.stderr)
    sys.exit(1)

PLANS = {
    "start": {"name": "TerraIQ Start", "monthly": 1900, "annual": 1500},
    "business": {"name": "TerraIQ Business", "monthly": 5900, "annual": 4700},
    "enterprise": {"name": "TerraIQ Enterprise", "monthly": 19900, "annual": 15900},
}


def api(path, data=None):
    url = f"https://api.stripe.com/v1{path}"
    req = urllib.request.Request(url, method="POST" if data is not None else "GET")
    req.add_header("Authorization", f"Bearer {API_KEY}")
    if data is not None:
        req.add_header("Content-Type", "application/x-www-form-urlencoded")
        req.data = urllib.parse.urlencode(data).encode()
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as exc:
        print(f"ERROR {exc.code}: {exc.read().decode()}", file=sys.stderr)
        sys.exit(1)


def find_existing_products():
    products = {}
    for p in api("/products?limit=100&active=true").get("data", []):
        products[p["name"]] = p["id"]
    return products


def find_price(product_id, amount, interval):
    prices = api(f"/prices?product={product_id}&limit=100&active=true").get("data", [])
    for p in prices:
        rec = p.get("recurring") or {}
        if p.get("unit_amount") == amount and p.get("currency") == "eur" and rec.get("interval") == interval:
            return p["id"]
    return None


def main():
    existing = find_existing_products()
    results = {}
    for key, cfg in PLANS.items():
        product_id = existing.get(cfg["name"])
        if product_id is None:
            product_id = api("/products", {"name": cfg["name"], "description": f"TerraIQ {cfg['name']} plan"})["id"]
            print(f"product {key}: created {product_id} ({cfg['name']})")
        else:
            print(f"product {key}: reuse {product_id} ({cfg['name']})")

        monthly_id = find_price(product_id, cfg["monthly"], "month")
        if monthly_id is None:
            monthly_id = api("/prices", {
                "product": product_id,
                "unit_amount": cfg["monthly"],
                "currency": "eur",
                "recurring[interval]": "month",
            })["id"]
            print(f"  monthly {cfg['monthly']/100:.0f} EUR: created {monthly_id}")
        else:
            print(f"  monthly {cfg['monthly']/100:.0f} EUR: reuse {monthly_id}")

        annual_id = find_price(product_id, cfg["annual"], "year")
        if annual_id is None:
            annual_id = api("/prices", {
                "product": product_id,
                "unit_amount": cfg["annual"],
                "currency": "eur",
                "recurring[interval]": "year",
            })["id"]
            print(f"  annual {cfg['annual']/100:.0f} EUR: created {annual_id}")
        else:
            print(f"  annual {cfg['annual']/100:.0f} EUR: reuse {annual_id}")

        results[key] = monthly_id

    print("\n=== Set these on Render (terraiq-api) and Vercel if needed ===")
    for key in PLANS:
        print(f"STRIPE_{key.upper()}_PRICE_ID={results[key]}")


if __name__ == "__main__":
    main()
