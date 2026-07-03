import os
import uuid
from typing import Any

import httpx


def _site_base() -> str:
    return (
        os.getenv("AGRINEXUS_LAW_BASE_URL", "https://www.agrinexuslaw.com")
        .strip()
        .rstrip("/")
    )


class AgrinexusClient:
    """Интеграция с AgriNexus.Law — търсене в архива и B2B договори."""

    def __init__(self, site_base: str | None = None):
        self.site_base = (site_base or _site_base()).rstrip("/")
        self.api_base = f"{self.site_base}/api"

    async def fetch_compliance_context(self, query: str, limit: int = 5) -> str:
        """
        RAG търсене в AgriNexus.Law (/api/search) за ДФЗ, ОСП, субсидии, наредби.
        """
        if not query.strip():
            return "[Празна заявка към AgriNexus.Law]"

        url = f"{self.api_base}/search"
        try:
            async with httpx.AsyncClient(timeout=25.0) as client:
                response = await client.post(
                    url,
                    json={"query": query.strip(), "category": "all"},
                    headers={"Content-Type": "application/json"},
                )
                if response.status_code != 200:
                    return (
                        f"[AgriNexus.Law search HTTP {response.status_code}. "
                        f"Провери {self.site_base}]"
                    )

                data: dict[str, Any] = response.json()
                parts: list[str] = []

                summary = data.get("aiSummary")
                if isinstance(summary, str) and summary.strip():
                    parts.append(f"Обобщение от AgriNexus.Law:\n{summary.strip()}")

                results = data.get("results") or []
                for doc in results[:limit]:
                    if not isinstance(doc, dict):
                        continue
                    title = str(doc.get("title") or "Документ")
                    content = str(doc.get("content") or "")[:900]
                    source = doc.get("sourceUrl") or doc.get("source") or self.site_base
                    parts.append(
                        f"• {title}\n{content}\nИзточник: {source}"
                    )

                if parts:
                    return "\n\n".join(parts)

                return (
                    "[Няма намерени документи в AgriNexus.Law за тази заявка. "
                    "Опитай по-конкретни ключови думи: ДФЗ, директни плащания, срок.]"
                )
        except httpx.TimeoutException:
            return "[AgriNexus.Law timeout — опитай отново]"
        except Exception as exc:
            return f"[AgriNexus.Law error: {exc}]"

    async def draft_b2b_contract(
        self, buyer: str, crop: str, quantity: float, price: float
    ) -> str:
        """
        Генерира B2B договор (MVP — mock URL; production: POST към legal engine).
        """
        _payload = {
            "buyer": buyer,
            "crop": crop,
            "quantity_tons": quantity,
            "price_per_ton": price,
            "contract_type": "B2B_AGRICULTURAL_SPOT",
        }
        contract_id = str(uuid.uuid4())[:8]
        return f"{self.api_base}/contracts/view/{contract_id}"


agrinexus_client = AgrinexusClient()
