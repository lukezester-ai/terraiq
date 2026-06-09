from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel
from orchestrator import run_orchestrator
from datetime import datetime

router = APIRouter()

class InboundInquiry(BaseModel):
    client_name: str
    client_email: str
    requested_crop: str
    quantity_tons: int
    destination: str
    additional_notes: str = ""

# A simple mock DB to hold inquiries and generated drafts
crm_db = {
    "inquiries": []
}

@router.post("/inbound")
async def receive_inquiry(inquiry: InboundInquiry, background_tasks: BackgroundTasks):
    """
    Endpoint to receive an inbound CRM inquiry (e.g., from n8n or a website form).
    Triggers the LangGraph orchestrator to evaluate the inquiry using the Sales Agent.
    """
    inquiry_id = f"inq_{int(datetime.now().timestamp())}"
    
    # Format the query for the AI Orchestrator
    query = (
        f"New Trade Inquiry from {inquiry.client_name} ({inquiry.client_email}). "
        f"They want to buy {inquiry.quantity_tons} tons of {inquiry.requested_crop} "
        f"delivered to {inquiry.destination}. Notes: {inquiry.additional_notes}. "
        f"Generate a commercial offer."
    )
    
    # Store inquiry
    record = {
        "id": inquiry_id,
        "timestamp": datetime.now().isoformat(),
        "inquiry": inquiry.dict(),
        "status": "Processing",
        "orchestrator_result": None
    }
    crm_db["inquiries"].append(record)

    # In a real app, we'd trigger this via a task queue (Celery/Kafka), 
    # but for now we await the orchestrator directly or run it in background
    try:
        # We run it directly to return the result, or we could use background_tasks
        result = await run_orchestrator(query=query, farm_id="system")
        record["status"] = "Draft Ready"
        record["orchestrator_result"] = result
        return {"status": "success", "inquiry_id": inquiry_id, "draft": result.get("final_recommendation")}
    except Exception as e:
        record["status"] = "Failed"
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/inquiries")
async def list_inquiries():
    """
    Returns all stored CRM inquiries and their generated AI drafts.
    """
    return {"status": "success", "data": crm_db["inquiries"]}
