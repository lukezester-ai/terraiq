import os
from typing import Any

import httpx


class CompetitorIntelligenceClient:
    """Fetches competitor/market intelligence from a configured compliant provider."""

    def __init__(self):
        self.api_url = os.getenv("COMPETITOR_INTEL_API_URL", "").strip()
        self.api_key = os.getenv("COMPETITOR_INTEL_API_KEY", "").strip()
        self.timeout_seconds = float(os.getenv("COMPETITOR_INTEL_TIMEOUT_SECONDS", "8"))

    async def scrape_competitor_pricing(self, product_query: str) -> str:
        if not self.api_url:
            return "Competitor intelligence unavailable: COMPETITOR_INTEL_API_URL is not configured."

        headers = {"Accept": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"

        async with httpx.AsyncClient(timeout=self.timeout_seconds) as client:
            response = await client.get(
                self.api_url,
                params={"query": product_query},
                headers=headers,
            )
            response.raise_for_status()
            data: dict[str, Any] = response.json()

        return f"Competitor intelligence provider response: {data}"


shadow_net = CompetitorIntelligenceClient()
