from fastapi import APIRouter, Depends, HTTPException
from models import RAGRequest, RAGResponse
from dependencies import get_llm_async, get_db
from sqlalchemy import text

router = APIRouter()

@router.post("/", response_model=RAGResponse)
async def rag_query(request: RAGRequest, llm=Depends(get_llm_async), db=Depends(get_db)):
    """Process a user query using OpenAI LLM.
    Future steps:
    1. Store query in DB for audit.
    2. Retrieve relevant docs via pgvector (not yet implemented).
    """
    try:
        response = await llm.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": request.query}],
            max_tokens=500,
        )
        answer = response.choices[0].message.content or ""
        # Simple audit log (optional)
        db.execute(text("INSERT INTO rag_audit (query, answer) VALUES (:q, :a) ON CONFLICT DO NOTHING"), {"q": request.query, "a": answer})
        return RAGResponse(answer=answer, sources=[])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
