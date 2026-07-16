import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# OpenTelemetry imports
from opentelemetry import trace
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
# from opentelemetry.exporter.prometheus import PrometheusMetricsExporter

from routers import rag, image, crm, payments, intelligence
from orchestrator import run_orchestrator
from infrastructure.kafka_client import close_kafka_producer
from typing import Optional
from pydantic import BaseModel

class OrchestrateRequest(BaseModel):
    query: str
    farm_id: Optional[str] = "farm_1"

# Initialize OpenTelemetry Tracer
resource = Resource(attributes={
    "service.name": "terraiq-fastapi",
    "service.version": "0.1.0",
})
provider = TracerProvider(resource=resource)
trace.set_tracer_provider(provider)
# Prometheus exporter (exposes at /metrics)
# prometheus_exporter = PrometheusMetricsExporter()
# provider.add_span_processor(BatchSpanProcessor(prometheus_exporter))

app = FastAPI(title="TerraIQ FastAPI", version="0.1.0")

cors_origins = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000,https://terraiq.me,https://www.terraiq.me",
    ).split(",")
    if origin.strip()
]

# CORS — allow frontend on localhost and Vercel domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Instrument FastAPI app
FastAPIInstrumentor().instrument_app(app)

app.include_router(rag.router, prefix="/rag", tags=["RAG"])
app.include_router(image.router, prefix="/upload", tags=["Image"])
app.include_router(crm.router, prefix="/crm", tags=["CRM"])
app.include_router(payments.router, prefix="/payments", tags=["Payments"])
app.include_router(intelligence.router, prefix="/intelligence", tags=["Enterprise Intelligence"])

@app.get("/")
async def root():
    return {"service": "TerraIQ API", "status": "running", "docs": "/docs"}

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.post("/orchestrate")
async def orchestrate(request: OrchestrateRequest):
    result = await run_orchestrator(request.query, request.farm_id)
    return {"status": "success", "recommendation": result["final_recommendation"], "details": result}


# FIX #10: Properly close Kafka producer on app shutdown to avoid resource leaks
@app.on_event("shutdown")
async def shutdown_event():
    await close_kafka_producer()


# Expose Prometheus metrics endpoint (provided by exporter)
# @app.get("/metrics")
# async def metrics():
#     return prometheus_exporter.metrics
