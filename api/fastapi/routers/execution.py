import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import os

router = APIRouter()

KONTOR21_API = os.getenv("KONTOR21_API_URL", "https://kontor21.onrender.com")


class EscrowRequest(BaseModel):
    counterparty: str
    commodity: str
    quantity_tons: float
    price_per_unit: float
    currency: str = "USDC"
    delivery_terms: str = "CIF"
    delivery_port: str
    delivery_date: str
    payment_milestones: int = 2
    buyer_wallet: str
    seller_wallet: str


class EscrowResponse(BaseModel):
    status: str
    escrow_id: str
    kontor21_url: Optional[str] = None
    contract_address: Optional[str] = None
    amount_usdc: float
    milestones: list[dict]
    instructions: str


@router.post("/escrow/propose", response_model=EscrowResponse)
async def propose_escrow(req: EscrowRequest):
    total = req.quantity_tons * req.price_per_unit
    milestone_amount = total / req.payment_milestones

    milestones = [
        {
            "milestone": i + 1,
            "trigger": f"Milestone {i + 1}: {'Deposit' if i == 0 else 'Delivery confirmed'}",
            "release_amount": round(milestone_amount, 2),
            "release_currency": req.currency,
        }
        for i in range(req.payment_milestones)
    ]

    condition_desc = f"{req.quantity_tons}t {req.commodity}, {req.delivery_terms} {req.delivery_port}, delivery {req.delivery_date}"

    kontor21_result = None
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(f"{KONTOR21_API}/api/escrow", json={
                "productName": req.commodity,
                "quantity": req.quantity_tons,
                "priceUsdc": req.price_per_unit,
                "buyerWallet": req.buyer_wallet,
                "sellerWallet": req.seller_wallet,
                "unit": "tons",
                "conditionDescription": condition_desc,
            })
            if resp.status_code == 200:
                kontor21_result = resp.json()
    except Exception:
        pass

    escrow_id = kontor21_result["tradeId"] if kontor21_result else (
        f"escrow_{req.counterparty[:8].lower()}_{abs(hash(condition_desc)) % 10000:04d}"
    )
    kontor21_url = kontor21_result["kontor21_url"] if kontor21_result else f"{KONTOR21_API}/trade/new?product={req.commodity}&quantity={req.quantity_tons}&price={req.price_per_unit}&buyer={req.buyer_wallet}&seller={req.seller_wallet}&terms={req.delivery_terms}&port={req.delivery_port}"

    return EscrowResponse(
        status="proposed",
        escrow_id=escrow_id,
        kontor21_url=kontor21_url,
        contract_address=None,
        amount_usdc=round(total, 2),
        milestones=milestones,
        instructions=(
            f"Proposed {req.payment_milestones}-milestone USDC escrow for {req.quantity_tons}t "
            f"{req.commodity} @ {req.price_per_unit}/t {req.currency}. "
            f"Total: {round(total, 2)} {req.currency}. "
            f"Open in kontor21 to sign with MetaMask: {kontor21_url}"
        ),
    )


@router.post("/escrow/confirm/{escrow_id}")
async def confirm_escrow(escrow_id: str):
    return {
        "status": "confirmed",
        "escrow_id": escrow_id,
        "message": f"Escrow {escrow_id} ready for kontor21 deployment.",
        "next_step": "Open kontor21 and sign the escrow with MetaMask",
    }
