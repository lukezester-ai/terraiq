from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import os

router = APIRouter()


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
    kontor21_endpoint: Optional[str] = None


class EscrowResponse(BaseModel):
    status: str
    escrow_id: str
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

    escrow_id = f"escrow_{req.counterparty[:8].lower()}_{hash(req.commodity + req.delivery_date) % 10000:04d}"

    kontor21_url = req.kontor21_endpoint or os.getenv("KONTOR21_API_URL", "http://localhost:3001")

    return EscrowResponse(
        status="proposed",
        escrow_id=escrow_id,
        contract_address=None,
        amount_usdc=round(total, 2),
        milestones=milestones,
        instructions=(
            f"Proposed {req.payment_milestones}-milestone USDC escrow for {req.quantity_tons}t "
            f"{req.commodity} @ {req.price_per_unit}/t {req.currency}. "
            f"Total: {round(total, 2)} {req.currency}. "
            f"Delivery: {req.delivery_terms} {req.delivery_port} by {req.delivery_date}. "
            f"Submit to kontor21 at {kontor21_url} for smart contract deployment."
        ),
    )


@router.post("/escrow/confirm/{escrow_id}")
async def confirm_escrow(escrow_id: str):
    return {
        "status": "confirmed",
        "escrow_id": escrow_id,
        "message": f"Escrow {escrow_id} ready for kontor21 deployment. "
                   "Deploy smart contract via kontor21 frontend or API.",
        "next_step": "Deploy KontorEscrow contract with terms above",
    }
