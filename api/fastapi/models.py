from pydantic import BaseModel, Field

class RAGRequest(BaseModel):
    query: str = Field(..., description="User query for retrieval‑augmented generation")
    top_k: int = Field(5, ge=1, le=20, description="Number of nearest documents to retrieve")

class RAGResponse(BaseModel):
    answer: str = Field(..., description="Generated answer from LLM")
    sources: list[str] = Field(default_factory=list, description="List of source document identifiers")

class ImageUploadResponse(BaseModel):
    status: str = Field(..., description="Queue status, e.g. 'queued'")
    correlation_id: str = Field(..., description="ID to track the processing job")
