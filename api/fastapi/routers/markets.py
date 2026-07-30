from fastapi import APIRouter, Query
from typing import Optional
import httpx

router = APIRouter()

COMMODITY_CATEGORIES = {
    "energy": ["Brent Crude", "WTI Crude", "Natural Gas (TTF)", "Natural Gas (JKM)", "Gasoil", "Bunker Fuel", "Carbon (EUA)", "Uranium"],
    "metals": ["LME Copper", "LME Aluminium", "LME Zinc", "LME Nickel", "Gold", "Silver", "Iron Ore 62%", "Steel Rebar"],
    "agriculture": ["CBOT Wheat", "CBOT Corn", "CBOT Soybeans", "ICE Sugar", "ICE Coffee", "ICE Cotton", "Euronext Wheat", "DCE Palm Oil"],
    "chemicals": ["Methanol", "Ethylene", "Propylene", "Benzene", "Paraxylene", "Ammonia", "Urea", "Methanol"],
    "fx": ["EUR/USD", "USD/JPY", "GBP/USD", "USD/BGN", "USD/CHF", "USD/CAD", "AUD/USD", "NZD/USD"],
    "finance": ["US 10Y Yield", "EURIBOR 3M", "SOFR", "CDX IG"],
}

COMMODITY_DEMO_PRICES = {
    "Brent Crude": {"price": 82.45, "unit": "USD/bbl", "change_24h": 1.2, "source": "ICE"},
    "WTI Crude": {"price": 78.30, "unit": "USD/bbl", "change_24h": -0.8, "source": "NYMEX"},
    "Natural Gas (TTF)": {"price": 34.50, "unit": "EUR/MWh", "change_24h": 3.4, "source": "ICE"},
    "Natural Gas (JKM)": {"price": 12.80, "unit": "USD/MMBtu", "change_24h": -2.1, "source": "Platts"},
    "Gasoil": {"price": 745.00, "unit": "USD/t", "change_24h": 0.5, "source": "ICE"},
    "Bunker Fuel": {"price": 610.00, "unit": "USD/t", "change_24h": -0.3, "source": "Platts"},
    "Carbon (EUA)": {"price": 68.50, "unit": "EUR/t", "change_24h": 1.8, "source": "EEX"},
    "Uranium": {"price": 58.20, "unit": "USD/lb", "change_24h": 0.0, "source": "UXC"},
    "LME Copper": {"price": 9850.00, "unit": "USD/t", "change_24h": 0.5, "source": "LME"},
    "LME Aluminium": {"price": 2560.00, "unit": "USD/t", "change_24h": -1.2, "source": "LME"},
    "LME Zinc": {"price": 2890.00, "unit": "USD/t", "change_24h": 0.8, "source": "LME"},
    "LME Nickel": {"price": 16750.00, "unit": "USD/t", "change_24h": 2.5, "source": "LME"},
    "Gold": {"price": 2340.00, "unit": "USD/oz", "change_24h": 0.3, "source": "LBMA"},
    "Silver": {"price": 28.50, "unit": "USD/oz", "change_24h": -0.7, "source": "LBMA"},
    "Iron Ore 62%": {"price": 108.00, "unit": "USD/t", "change_24h": -1.5, "source": "SGX"},
    "Steel Rebar": {"price": 540.00, "unit": "USD/t", "change_24h": 0.0, "source": "Mysteel"},
    "CBOT Wheat": {"price": 245.50, "unit": "USD/t", "change_24h": -1.1, "source": "CBOT"},
    "CBOT Corn": {"price": 198.30, "unit": "USD/t", "change_24h": 0.4, "source": "CBOT"},
    "CBOT Soybeans": {"price": 432.00, "unit": "USD/t", "change_24h": 0.8, "source": "CBOT"},
    "ICE Sugar": {"price": 0.21, "unit": "USD/lb", "change_24h": -2.3, "source": "ICE"},
    "ICE Coffee": {"price": 1.85, "unit": "USD/lb", "change_24h": 1.5, "source": "ICE"},
    "ICE Cotton": {"price": 0.76, "unit": "USD/lb", "change_24h": -0.9, "source": "ICE"},
    "Euronext Wheat": {"price": 228.00, "unit": "EUR/t", "change_24h": -0.5, "source": "Euronext"},
    "DCE Palm Oil": {"price": 3890.00, "unit": "CNY/t", "change_24h": 1.1, "source": "DCE"},
    "Methanol": {"price": 295.00, "unit": "USD/t", "change_24h": -0.4, "source": "Platts"},
    "Ethylene": {"price": 880.00, "unit": "USD/t", "change_24h": 0.6, "source": "Platts"},
    "Propylene": {"price": 845.00, "unit": "USD/t", "change_24h": 0.2, "source": "Platts"},
    "Benzene": {"price": 920.00, "unit": "USD/t", "change_24h": 1.8, "source": "Platts"},
    "Paraxylene": {"price": 1025.00, "unit": "USD/t", "change_24h": -0.1, "source": "Platts"},
    "Ammonia": {"price": 410.00, "unit": "USD/t", "change_24h": 3.2, "source": "Argus"},
    "Urea": {"price": 345.00, "unit": "USD/t", "change_24h": 0.0, "source": "Argus"},
    "US 10Y Yield": {"price": 4.28, "unit": "%", "change_24h": 0.02, "source": "Treasury"},
    "EURIBOR 3M": {"price": 3.45, "unit": "%", "change_24h": -0.01, "source": "ECB"},
    "SOFR": {"price": 5.33, "unit": "%", "change_24h": 0.00, "source": "NY Fed"},
    "CDX IG": {"price": 58.00, "unit": "bps", "change_24h": -0.50, "source": "Markit"},
}


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
