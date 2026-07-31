from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy import JSON, bindparam, text
from sqlalchemy.orm import Session

from dependencies import get_db
from orchestrator import run_orchestrator
from verification import (
    build_deal,
    create_kontor21_escrow,
    market_benchmark,
    verify_deal,
)

router = APIRouter()


class InboundInquiry(BaseModel):
    client_name: str
    client_email: str
    requested_crop: str
    quantity_tons: int
    destination: str
    additional_notes: str = ""
    buyer_wallet: str = ""
    seller_wallet: str = ""


def _serialize_record(row) -> dict:
    data = dict(row._mapping)
    created_at = data.pop("created_at", None)
    return {
        "id": data["id"],
        "timestamp": created_at.isoformat() if created_at else None,
        "status": data["status"],
        "inquiry": {
            "client_name": data["client_name"],
            "client_email": data["client_email"],
            "requested_crop": data["requested_crop"],
            "quantity_tons": data["quantity_tons"],
            "destination": data["destination"],
            "additional_notes": data["additional_notes"],
        },
        "orchestrator_result": data["orchestrator_result"],
    }


@router.post("/inbound")
async def receive_inquiry(inquiry: InboundInquiry, db: Session = Depends(get_db)):
    """
    Receive an inbound CRM inquiry and persist the AI-generated draft.
    A production version should move the orchestrator call to the queue.
    """
    inquiry_id = f"inq_{uuid4().hex}"
    query = (
        f"New Trade Inquiry from {inquiry.client_name} ({inquiry.client_email}). "
        f"They want to buy {inquiry.quantity_tons} tons of {inquiry.requested_crop} "
        f"delivered to {inquiry.destination}. Notes: {inquiry.additional_notes}. "
        f"Generate a commercial offer."
    )

    benchmark_price, benchmark_unit, benchmark_source = market_benchmark(inquiry.requested_crop)
    deal = build_deal(inquiry.model_dump(), benchmark_price, benchmark_source)

    db.execute(
        text(
            """
            INSERT INTO crm_inquiries (
                id, client_name, client_email, requested_crop, quantity_tons,
                destination, additional_notes, status
            ) VALUES (
                :id, :client_name, :client_email, :requested_crop, :quantity_tons,
                :destination, :additional_notes, :status
            )
            """
        ),
        {
            "id": inquiry_id,
            "client_name": inquiry.client_name,
            "client_email": inquiry.client_email,
            "requested_crop": inquiry.requested_crop,
            "quantity_tons": inquiry.quantity_tons,
            "destination": inquiry.destination,
            "additional_notes": inquiry.additional_notes,
            "status": "Processing",
        },
    )

    try:
        result = await run_orchestrator(query=query, farm_id="system")

        verified = await verify_deal(deal)
        verdict = verified["verification"]
        status = "Deal Created" if verdict["auto_create"] else (
            "Verification Review" if verdict["verdict"] == "MANUAL_REVIEW" else "Rejected"
        )

        trade_id = None
        kontor21_url = None
        if verdict["auto_create"]:
            created = await create_kontor21_escrow(deal)
            if created["status"] == "draft_created":
                response = created["response"]
                trade_id = response.get("tradeId")
                kontor21_url = response.get("kontor21_url")
                status = "Deal Created"

        result["verification"] = verified
        result["deal"] = deal
        result["trade_id"] = trade_id
        result["kontor21_url"] = kontor21_url

        update_statement = text(
            """
            UPDATE crm_inquiries
            SET status = :status,
                orchestrator_result = :orchestrator_result,
                updated_at = now()
            WHERE id = :id
            """
        ).bindparams(bindparam("orchestrator_result", type_=JSON))
        db.execute(
            update_statement,
            {
                "id": inquiry_id,
                "status": status,
                "orchestrator_result": result,
            },
        )
        return {
            "status": "success",
            "inquiry_id": inquiry_id,
            "deal_status": status,
            "verdict": verdict["verdict"],
            "confidence": verdict["confidence"],
            "draft": result.get("final_recommendation"),
            "trade_id": trade_id,
            "kontor21_url": kontor21_url,
        }
    except Exception as exc:
        db.execute(
            text(
                """
                UPDATE crm_inquiries
                SET status = :status, updated_at = now()
                WHERE id = :id
                """
            ),
            {"id": inquiry_id, "status": "Failed"},
        )
        return JSONResponse(
            status_code=202,
            content={
                "status": "failed",
                "inquiry_id": inquiry_id,
                "detail": str(exc),
            },
        )


@router.get("/inquiries")
async def list_inquiries(db: Session = Depends(get_db)):
    """Return persisted CRM inquiries and generated AI drafts."""
    rows = db.execute(
        text(
            """
            SELECT id, client_name, client_email, requested_crop, quantity_tons,
                   destination, additional_notes, status, orchestrator_result, created_at
            FROM crm_inquiries
            ORDER BY created_at DESC
            LIMIT 100
            """
        )
    ).fetchall()
    return {"status": "success", "data": [_serialize_record(row) for row in rows]}
