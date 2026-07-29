from fastapi import APIRouter, Query
from typing import Optional

router = APIRouter()

COMMODITY_CATEGORIES = {
    "energy": ["Brent Crude", "WTI Crude", "Natural Gas (TTF)", "Natural Gas (JKM)", "Gasoil", "Bunker Fuel", "Carbon (EUA)", "Uranium"],
    "metals": ["LME Copper", "LME Aluminium", "LME Zinc", "LME Nickel", "Gold", "Silver", "Iron Ore 62%", "Steel Rebar"],
    "agriculture": ["CBOT Wheat", "CBOT Corn", "CBOT Soybeans", "ICE Sugar", "ICE Coffee", "ICE Cotton", "Euronext Wheat", "DCE Palm Oil"],
    "chemicals": ["Methanol", "Ethylene", "Propylene", "Benzene", "Paraxylene", "Ammonia", "Urea", "Methanol"],
    "finance": ["EUR/USD", "USD/JPY", "GBP/USD", "USD/BGN", "US 10Y Yield", "EURIBOR 3M", "SOFR", "CDX IG"],
}

COMMODITY_DEMO_PRICES = {
    "Brent Crude": {"price": 82.45, "unit": "USD/bbl", "change_24h": "+1.2%", "source": "ICE"},
    "WTI Crude": {"price": 78.30, "unit": "USD/bbl", "change_24h": "-0.8%", "source": "NYMEX"},
    "Natural Gas (TTF)": {"price": 34.50, "unit": "EUR/MWh", "change_24h": "+3.4%", "source": "ICE"},
    "LME Copper": {"price": 9850.00, "unit": "USD/t", "change_24h": "+0.5%", "source": "LME"},
    "Gold": {"price": 2340.00, "unit": "USD/oz", "change_24h": "+0.3%", "source": "LBMA"},
    "CBOT Wheat": {"price": 245.50, "unit": "USD/t", "change_24h": "-1.1%", "source": "CBOT"},
    "EUR/USD": {"price": 1.0825, "unit": "rate", "change_24h": "+0.15%", "source": "FX"},
    "US 10Y Yield": {"price": 4.28, "unit": "%", "change_24h": "+2bp", "source": "Treasury"},
}


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
    if category:
        valid = {k.lower(): v for k, v in COMMODITY_CATEGORIES.items()}
        cat = valid.get(category.lower())
        if not cat:
            return {"error": f"Unknown category. Available: {list(valid.keys())}"}
        result = {c: COMMODITY_DEMO_PRICES.get(c, {"price": "N/A", "unit": "N/A", "change_24h": "N/A", "source": "stub"}) for c in cat}
        return {"category": category, "count": len(result), "prices": result}
    return {"categories": {k: len(v) for k, v in COMMODITY_CATEGORIES.items()}, "total": sum(len(v) for v in COMMODITY_CATEGORIES.values())}
