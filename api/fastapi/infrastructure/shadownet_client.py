import os
from typing import Any

import httpx


def _site_base() -> str:
    return (
        os.getenv("COMPETITOR_INTEL_API_URL", "").strip()
    )


class CompetitorIntelligenceClient:
    """Fetches competitor/market intelligence from a configured compliant provider."""

    def __init__(self):
        self.api_url = os.getenv("COMPETITOR_INTEL_API_URL", "").strip()
        self.api_key = os.getenv("COMPETITOR_INTEL_API_KEY", "").strip()
        self.timeout_seconds = float(os.getenv("COMPETITOR_INTEL_TIMEOUT_SECONDS", "8"))

    async def scrape_competitor_pricing(self, product_query: str) -> str:
        # FIX #5: Return a graceful message if the API URL is not configured.
        if not self.api_url:
            return "Competitor intelligence unavailable: COMPETITOR_INTEL_API_URL is not configured."

        headers = {"Accept": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"

        # FIX #5: Wrap the HTTP call in try/except so a failing competitor
        # intelligence API does not crash the entire market_agent or sales_agent.
        try:
            async with httpx.AsyncClient(timeout=self.timeout_seconds) as client:
                response = await client.get(
                    self.api_url,
                    params={"query": product_query},
                    headers=headers,
                )
                response.raise_for_status()
                data: dict[str, Any] = response.json()
            return f"Competitor intelligence provider response: {data}"
        except httpx.TimeoutException:
            return "Competitor intelligence unavailable: request timed out."
        except httpx.HTTPStatusError as e:
            return f"Competitor intelligence unavailable: HTTP {e.response.status_code}."
        except Exception as e:
            return f"Competitor intelligence unavailable: {e}"


shadow_net = CompetitorIntelligenceClient()
