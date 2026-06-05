from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
import aio_pika
import uuid

router = APIRouter()

async def get_rabbitmq_channel():
    # Simple connection getter – in production use a proper connection pool
    connection = await aio_pika.connect_robust("amqp://guest:guest@rabbitmq:5672/")
    return await connection.channel()

@router.post("/", summary="Upload image for AI analysis")
async def upload_image(file: UploadFile = File(...), channel=Depends(get_rabbitmq_channel)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed")

    # Read file content (could be streamed for large files)
    content = await file.read()
    # Prepare a message payload – we just send the raw bytes and a correlation id
    correlation_id = str(uuid.uuid4())
    message = aio_pika.Message(
        body=content,
        correlation_id=correlation_id,
        headers={"filename": file.filename},
        delivery_mode=aio_pika.DeliveryMode.PERSISTENT,
    )
    # Publish to a direct exchange named "image_processing"
    exchange = await channel.declare_exchange("image_processing", aio_pika.ExchangeType.DIRECT)
    await exchange.publish(message, routing_key="process")
    return {"status": "queued", "correlation_id": correlation_id}
