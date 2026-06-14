import os
from typing import Any

import httpx


class MarketIngestionService:
    """
    Pulls market prices from a configured HTTP provider.
    MARKET_PRICE_API_URL may include {symbol}, for example:
    https://provider.example/prices?symbol={symbol}
    """

    def __init__(self):
        self.api_url = os.getenv("MARKET_PRICE_API_URL", "").strip()
        self.api_key = os.getenv("MARKET_PRICE_API_KEY", "").strip()
        self.timeout_seconds = float(os.getenv("MARKET_PRICE_TIMEOUT_SECONDS", "8"))

    async def fetch_commodity_price(self, symbol: str = "ZW=F") -> dict[str, Any]:
        if not self.api_url:
            return {
                "symbol": symbol,
                "status": "not_configured",
                "message": "MARKET_PRICE_API_URL is not configured.",
            }

        url = self.api_url.replace("{symbol}", symbol)
        headers = {"Accept": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"

        async with httpx.AsyncClient(timeout=self.timeout_seconds) as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            data = response.json()

        return {
            "symbol": symbol,
            "status": "live",
            "provider_url": self.api_url,
            "data": data,
        }


market_ingest = MarketIngestionService()
