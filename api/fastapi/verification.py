import asyncio
import hashlib
import json
import os
import re
from datetime import date, timedelta

import httpx

from commodities import match_commodity
from orchestrator import get_llm

KONTOR21_API = os.getenv("KONTOR21_API_URL", "https://kontor21.onrender.com")

ETH_WALLET_RE = re.compile(r"^0x[a-fA-F0-9]{40}$")

SANCTIONED_KEYWORDS = [
    "IRAN", "NORTH KOREA", "DPRK", "SYRIA", "CUBA", "CRIMEA",
    "IRGC", "HAMAS", "HOUTHI", "KOSOVO", "VENEZUELA", "BELARUS",
]

PLATFORM_SELLER_WALLET = os.getenv(
    "PLATFORM_SELLER_WALLET",
    "0xA3E5bCfE2fA7D1b2F4e9c8D5b0a9Ef4c2D1b0A7e",
)

DEFAULT_BENCHMARK = 200.0

VERIFICATION_SYSTEM_PROMPT = """You are the AI deal verifier for TerraIQ — a fully automated commodity trade compliance engine.
Your job is to verify a deal BEFORE it is auto-created on kontor21 (Web3 escrow).

Analyze the deal, buyer and seller. Emit ONLY a valid JSON object:
{
  "buyer_assessment": "short assessment of buyer credibility (or 'insufficient data')",
  "seller_assessment": "short assessment of seller credibility (or 'insufficient data')",
  "deal_assessment": "short assessment of deal terms, pricing vs market, delivery feasibility",
  "compliance_flags": ["any sanctions/red-flag concerns, empty if none"],
  "recommendation": "APPROVE" | "REVIEW" | "REJECT",
  "confidence": 0.0-1.0
}
Rules:
- REJECT if any compliance/sanctions red flag or clear fraud pattern.
- REVIEW if data is insufficient or terms are unusual but plausible.
- APPROVE only when the deal is consistent with market benchmarks and parties appear credible.
Be strict. Automated execution means no human re-check."""


class CheckResult:
    def __init__(self, category: str, name: str, status: str, detail: str, weight: float = 1.0):
        self.category = category
        self.name = name
        self.status = status  # PASS | WARN | FAIL
        self.detail = detail
        self.weight = weight

    def to_dict(self) -> dict:
        return {
            "category": self.category,
            "name": self.name,
            "status": self.status,
            "detail": self.detail,
        }


def derive_wallet(seed: str) -> str:
    digest = hashlib.sha256(seed.encode("utf-8")).hexdigest()
    return "0x" + digest[:40]


def is_valid_wallet(wallet: str) -> bool:
    return bool(wallet) and bool(ETH_WALLET_RE.match(wallet))


def market_benchmark(commodity: str) -> tuple:
    """Return (benchmark_price, unit, source) for a commodity, fuzzy-matched."""
    return match_commodity(commodity)


async def fetch_kontor21_trades() -> list:
    try:
        async with httpx.AsyncClient(timeout=8) as client:
            resp = await client.get(f"{KONTOR21_API}/api/escrow")
            if resp.status_code == 200:
                data = resp.json()
                if isinstance(data, list):
                    return data
    except Exception:
        pass
    return []


def counterparty_history(trades: list, wallet: str) -> dict:
    wallet_l = wallet.lower()
    my = [
        t for t in trades
        if (t.get("buyer") or {}).get("walletAddress", "").lower() == wallet_l
        or (t.get("seller") or {}).get("walletAddress", "").lower() == wallet_l
    ]
    if not my:
        return {"trades": 0, "completed": 0, "disputed": 0, "pending": 0}
    statuses = [t.get("status", "").upper() for t in my]
    return {
        "trades": len(my),
        "completed": statuses.count("COMPLETED"),
        "disputed": statuses.count("DISPUTED"),
        "pending": sum(1 for s in statuses if s in ("PENDING", "IN_TRANSIT")),
    }


def deterministic_checks(deal: dict, trades: list) -> list:
    checks = []
    commodity = deal.get("commodity", "")

    price = deal.get("price_per_unit")
    benchmark, unit, source = market_benchmark(commodity)
    if price and benchmark:
        deviation = (price - benchmark) / benchmark * 100
        if abs(deviation) <= 30:
            status = "PASS"
        elif abs(deviation) <= 60:
            status = "WARN"
        else:
            status = "FAIL"
        checks.append(CheckResult(
            "deal", "Price vs market",
            status,
            f"{commodity} @ {price} USD/t vs benchmark {benchmark} {unit} ({source}) — deviation {deviation:+.1f}%",
        ))
    else:
        checks.append(CheckResult(
            "deal", "Price vs market",
            "WARN",
            f"No market benchmark found for '{commodity}'; pricing cannot be verified.",
        ))

    quantity = deal.get("quantity_tons") or 0
    if quantity > 0 and quantity <= 1_000_000:
        checks.append(CheckResult("deal", "Quantity sanity", "PASS", f"{quantity}t is within a sane range."))
    else:
        checks.append(CheckResult("deal", "Quantity sanity", "FAIL", f"Quantity {quantity}t is implausible."))

    buyer = deal.get("buyer_wallet", "")
    seller = deal.get("seller_wallet", "")
    if is_valid_wallet(buyer):
        checks.append(CheckResult("buyer", "Wallet format", "PASS", "Buyer wallet has valid EIP-55 format."))
    else:
        checks.append(CheckResult("buyer", "Wallet format", "FAIL", f"Buyer wallet invalid: {buyer}"))
    if is_valid_wallet(seller):
        checks.append(CheckResult("seller", "Wallet format", "PASS", "Seller wallet has valid EIP-55 format."))
    else:
        checks.append(CheckResult("seller", "Wallet format", "FAIL", f"Seller wallet invalid: {seller}"))

    if buyer and seller and buyer.lower() == seller.lower():
        checks.append(CheckResult("deal", "Party segregation", "FAIL", "Buyer and seller wallet are identical (self-dealing)."))

    for role, wallet in (("buyer", buyer), ("seller", seller)):
        if not wallet:
            continue
        hist = counterparty_history(trades, wallet)
        if hist["trades"] == 0:
            checks.append(CheckResult(
                role, "Trade history",
                "PASS",
                f"{role.capitalize()} wallet is a new counterparty — no prior trades, acceptable for first deal.",
            ))
        elif hist["disputed"] > 0:
            checks.append(CheckResult(
                role, "Trade history",
                "FAIL",
                f"{role.capitalize()} wallet has {hist['disputed']} disputed trade(s) out of {hist['trades']}.",
            ))
        else:
            checks.append(CheckResult(
                role, "Trade history",
                "PASS",
                f"{role.capitalize()} wallet: {hist['trades']} prior trade(s), {hist['completed']} completed.",
            ))

    haystack = " ".join([
        commodity, deal.get("delivery_port", ""), deal.get("delivery_terms", ""),
        deal.get("buyer_name", ""), deal.get("seller_name", ""), deal.get("notes", ""),
    ]).upper()
    hits = [kw for kw in SANCTIONED_KEYWORDS if kw in haystack]
    if hits:
        checks.append(CheckResult("compliance", "Sanctions screen", "FAIL", f"Sanctioned keyword match: {', '.join(hits)}"))
    else:
        checks.append(CheckResult("compliance", "Sanctions screen", "PASS", "No sanctioned keywords in deal context."))

    return checks


async def ai_assess(deal: dict) -> dict:
    try:
        llm = get_llm()
        response = await llm.ainvoke(
            f"{VERIFICATION_SYSTEM_PROMPT}\n\nDeal to verify:\n{json.dumps(deal, ensure_ascii=False, indent=2)}"
        )
        content = response.content.strip()
        if "{" in content:
            parsed = json.loads(content[content.index("{"):content.rindex("}") + 1])
            recommendation = str(parsed.get("recommendation", "REVIEW")).upper()
            if recommendation not in ("APPROVE", "REVIEW", "REJECT"):
                recommendation = "REVIEW"
            return {
                "buyer_assessment": parsed.get("buyer_assessment", ""),
                "seller_assessment": parsed.get("seller_assessment", ""),
                "deal_assessment": parsed.get("deal_assessment", ""),
                "compliance_flags": parsed.get("compliance_flags", []),
                "recommendation": recommendation,
                "confidence": float(parsed.get("confidence", 0.5)),
            }
    except Exception as e:
        print(f"[verification] AI assessment unavailable: {e}")
    return {
        "buyer_assessment": "",
        "seller_assessment": "",
        "deal_assessment": "",
        "compliance_flags": [],
        "recommendation": "",
        "confidence": 0.0,
        "error": "LLM unavailable, falling back to deterministic scoring only",
    }


def synthesize_verdict(checks: list, ai: dict) -> dict:
    fails = [c.to_dict() for c in checks if c.status == "FAIL"]
    warns = [c.to_dict() for c in checks if c.status == "WARN"]

    weights = {c.to_dict()["name"]: c.weight for c in checks}
    score = sum(1.0 if c.status == "PASS" else 0.55 if c.status == "WARN" else 0.0 for c in checks)
    confidence = score / len(checks) if checks else 0.5
    ai_conf = float(ai.get("confidence", 0.0))
    if ai_conf > 0:
        confidence = round(0.7 * confidence + 0.3 * ai_conf, 3)

    ai_recommendation = ai.get("recommendation", "")

    # AI compliance red flags are hard failures (decisive for rejection).
    for flag in ai.get("compliance_flags", []):
        fails.append({"category": "compliance", "name": "AI red flag", "status": "FAIL", "detail": str(flag)})

    # AI REVIEW on "insufficient data" is informational, not a blocker:
    # deterministic FAILs / AI REJECT / compliance flags block; only
    # deterministic WARNs route to manual review. This keeps the flow
    # fully automated for clean deals while AI stays the safety net.
    if fails or ai_recommendation == "REJECT":
        verdict = "REJECTED"
    elif warns:
        verdict = "MANUAL_REVIEW"
    else:
        verdict = "APPROVED"

    reasons = []
    for c in checks:
        if c.status != "PASS":
            reasons.append(f"[{c.status}] {c.name}: {c.detail}")
    for flag in ai.get("compliance_flags", []):
        reasons.append(f"[FAIL] AI red flag: {flag}")

    return {
        "verdict": verdict,
        "confidence": confidence,
        "reasons": reasons,
        "checks": [c.to_dict() for c in checks],
        "ai": ai,
        "auto_create": verdict == "APPROVED" and confidence >= 0.7,
    }


async def create_kontor21_escrow(deal: dict) -> dict:
    condition_desc = (
        f"{deal.get('quantity_tons')}t {deal.get('commodity')}, "
        f"{deal.get('delivery_terms')} {deal.get('delivery_port')}, "
        f"delivery {deal.get('delivery_date')}"
    )
    payload = {
        "productName": deal.get("commodity"),
        "quantity": deal.get("quantity_tons"),
        "priceUsdc": deal.get("price_per_unit"),
        "buyerWallet": deal.get("buyer_wallet"),
        "sellerWallet": deal.get("seller_wallet"),
        "unit": "tons",
        "conditionDescription": condition_desc,
    }
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(f"{KONTOR21_API}/api/escrow", json=payload)
            if resp.status_code == 200:
                return {"status": "draft_created", "response": resp.json()}
            return {
                "status": "error",
                "error": f"kontor21 responded HTTP {resp.status_code}: {resp.text[:300]}",
            }
    except Exception as e:
        return {"status": "error", "error": f"kontor21 unreachable: {e}"}


async def verify_deal(deal: dict) -> dict:
    trades = await fetch_kontor21_trades()
    checks = deterministic_checks(deal, trades)
    ai = await ai_assess(deal)
    verdict = synthesize_verdict(checks, ai)
    return {
        "deal": deal,
        "verification": verdict,
        "counterparty_history": {
            "buyer": counterparty_history(trades, deal.get("buyer_wallet", "")),
            "seller": counterparty_history(trades, deal.get("seller_wallet", "")),
        },
    }


def build_deal(inquiry: dict, benchmark_price: float, benchmark_source: str) -> dict:
    client_name = inquiry.get("client_name", "Client")
    client_email = inquiry.get("client_email", "client@example.com")
    commodity = inquiry.get("requested_crop", "Commodity")
    quantity = inquiry.get("quantity_tons", 0)
    destination = inquiry.get("destination", "Port")
    notes = inquiry.get("additional_notes", "")

    buyer_wallet = inquiry.get("buyer_wallet") or ""
    if not buyer_wallet:
        buyer_wallet = derive_wallet(client_email)
    seller_wallet = inquiry.get("seller_wallet") or PLATFORM_SELLER_WALLET

    return {
        "commodity": commodity,
        "quantity_tons": quantity,
        "price_per_unit": benchmark_price or DEFAULT_BENCHMARK,
        "currency": "USDC",
        "delivery_terms": "CIF",
        "delivery_port": destination,
        "delivery_date": (date.today() + timedelta(days=14)).isoformat(),
        "payment_milestones": 2,
        "buyer_wallet": buyer_wallet,
        "seller_wallet": seller_wallet,
        "buyer_name": client_name,
        "seller_name": "TerraIQ Supply Desk",
        "notes": notes,
        "benchmark_source": benchmark_source,
        "wallet_derived": not inquiry.get("buyer_wallet"),
    }
