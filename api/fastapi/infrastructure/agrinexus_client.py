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


def _get_local_rag_fallback(query: str) -> list[str]:
    results = []
    try:
        from infrastructure.qdrant_client import qdrant_client
        res = qdrant_client.search_market_data(query, limit=3)
        if res:
            for r in res:
                if hasattr(r, "payload") and isinstance(r.payload, dict):
                    text = r.payload.get("text", "")
                    if text and text not in results:
                        results.append(text)
    except Exception:
        pass
    
    # Query our rich regulatory knowledge base (regulatory_kb.py)
    try:
        from infrastructure.regulatory_kb import search_regulatory_kb
        kb_matches = search_regulatory_kb(query, limit=4)
        for m in kb_matches:
            if m not in results:
                results.append(m)
    except Exception:
        pass

    # Fallback if both qdrant and kb returned empty
    if not results and query.strip():
        results.append("ДФЗ (Държавен фонд Земеделие) - Кампания за Директни Плащания: Крайният срок за подаване на заявления за подпомагане без санкция е 30 юни. Заявления, подадени до 25 юли, се санкционират с 1% за всеки работен ден закъснение.")
        results.append("Наредба № 3 за условията и реда за прилагане на интервенциите под формата на директни плащания: Задължително е воденето на Електронен дневник на растителната защита в СЕУ на ДФЗ преди всяко третиране.")
        
    return results


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

                fallback_parts = _get_local_rag_fallback(query)
                if fallback_parts:
                    return f"[Локална RAG База Знания / ДФЗ & ОСП]:\n\n" + "\n\n".join(f"• {doc}" for doc in fallback_parts)
                return (
                    "[Няма намерени документи в AgriNexus.Law за тази заявка. "
                    "Опитай по-конкретни ключови думи: ДФЗ, директни плащания, срок.]"
                )
        except (httpx.TimeoutException, Exception) as exc:
            fallback_parts = _get_local_rag_fallback(query)
            if fallback_parts:
                return f"[Локална RAG База Знания (AgriNexus Fallback) — {query}]:\n\n" + "\n\n".join(f"• {doc}" for doc in fallback_parts)
            return f"[AgriNexus.Law error/timeout: {exc}]"

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
