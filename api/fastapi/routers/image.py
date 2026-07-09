import base64
import json
import os
import uuid

import aio_pika
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

router = APIRouter()

MAX_IMAGE_BYTES = int(os.getenv("MAX_IMAGE_UPLOAD_BYTES", "5242880"))
RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672/")


# Global connection pool to prevent connection leaks
_rabbitmq_connection = None


async def get_rabbitmq_connection():
    global _rabbitmq_connection
    if _rabbitmq_connection is None or _rabbitmq_connection.is_closed:
        _rabbitmq_connection = await aio_pika.connect_robust(RABBITMQ_URL)
    return _rabbitmq_connection


async def get_rabbitmq_channel():
    connection = await get_rabbitmq_connection()
    return await connection.channel()


@router.post("/", summary="Upload image for AI analysis")
async def upload_image(file: UploadFile = File(...), channel=Depends(get_rabbitmq_channel)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed")

    content = await file.read()
    if len(content) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="Image is too large")

    correlation_id = str(uuid.uuid4())
    payload = {
        "image_bytes": base64.b64encode(content).decode("ascii"),
        "filename": file.filename or f"{correlation_id}.png",
        "content_type": file.content_type,
    }
    message = aio_pika.Message(
        body=json.dumps(payload).encode("utf-8"),
        correlation_id=correlation_id,
        content_type="application/json",
        headers={"filename": file.filename or ""},
        delivery_mode=aio_pika.DeliveryMode.PERSISTENT,
    )
    exchange = await channel.declare_exchange("image_processing", aio_pika.ExchangeType.DIRECT)
    await exchange.publish(message, routing_key="process")
    await channel.close()
    return {"status": "queued", "correlation_id": correlation_id}
