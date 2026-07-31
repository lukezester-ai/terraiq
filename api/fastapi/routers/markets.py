from fastapi import APIRouter, Query
from typing import Optional
import httpx

from commodities import COMMODITY_CATEGORIES, COMMODITY_DEMO_PRICES

router = APIRouter()


async def fetch_live_fx() -> dict:
    pairs = {"EUR/USD": "EUR", "USD/JPY": "JPY", "GBP/USD": "GBP", "USD/CHF": "CHF",
             "USD/CAD": "CAD", "AUD/USD": "AUD", "NZD/USD": "NZD", "USD/BGN": "BGN"}
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            resp = await client.get("https://api.exchangerate-api.com/v4/latest/USD")
            if resp.status_code == 200:
                rates = resp.json()["rates"]
                result = {}
                for pair, code in pairs.items():
                    if code in rates:
                        rate = rates[code]
                        result[pair] = {
                            "price": round(rate if pair.startswith("USD/") else 1 / rate, 4),
                            "unit": "rate",
                            "change_24h": 0.0,
                            "source": "ExchangeRate-API",
                        }
                return result
    except Exception:
        pass
    return {}


@router.get("/categories")
async def get_categories():
    return COMMODITY_CATEGORIES


@router.get("/prices/{commodity}")
async def get_price(commodity: str):
    normalized = commodity.replace("-", " ").title()
    for key, val in COMMODITY_DEMO_PRICES.items():
        if key.lower() == normalized.lower() or key.split()[-1].lower() == normalized.lower():
            return {"commodity": key, **val}
    return {"commodity": commodity, "price": "N/A", "unit": "N/A", "change_24h": "N/A", "source": "not_found"}


@router.get("/prices")
async def list_prices(category: Optional[str] = Query(None)):
    prices = {**COMMODITY_DEMO_PRICES}
    live_fx = await fetch_live_fx()
    prices.update(live_fx)

    if category:
        valid = {k.lower(): v for k, v in COMMODITY_CATEGORIES.items()}
        cat = valid.get(category.lower())
        if not cat:
            return {"error": f"Unknown category. Available: {list(valid.keys())}"}
        result = {c: prices.get(c, {"price": "N/A", "unit": "N/A", "change_24h": "N/A", "source": "stub"}) for c in cat}
        return {"category": category, "count": len(result), "prices": result}
    return {"categories": {k: len(v) for k, v in COMMODITY_CATEGORIES.items()}, "total": sum(len(v) for v in COMMODITY_CATEGORIES.values())}
