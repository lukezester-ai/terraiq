import asyncio
import json
import os
import uuid
from typing import Any

import aio_pika
from openai import AsyncOpenAI
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

# Database setup (async) – using asyncpg
DATABASE_URL = os.getenv(
    "DATABASE_URL_ASYNC",
    "postgresql+asyncpg://terraiq:terraiqpass@localhost:5432/terraiqdb",
)
engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(
    bind=engine, class_=AsyncSession, expire_on_commit=False
)

openai_client = AsyncOpenAI()

async def process_image(message: aio_pika.IncomingMessage) -> None:
    async with message.process():
        payload = json.loads(message.body)
        image_bytes = payload.get("image_bytes")
        filename = payload.get("filename", f"{uuid.uuid4()}.png")
        correlation_id = message.correlation_id or str(uuid.uuid4())
        # Call OpenAI Vision (gpt-4o) – placeholder
        try:
            response = await openai_client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": "Analyse the image and provide a short description."},
                            {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{image_bytes}"}},
                        ],
                    }
                ],
                max_tokens=300,
            )
            analysis = response.choices[0].message.content or ""
        except Exception as e:
            analysis = f"Error during analysis: {e}"

        # Store result in DB (simple table placeholder)
        async with AsyncSessionLocal() as session:
            # Ensure table exists
            await session.execute(
                text("""
                CREATE TABLE IF NOT EXISTS image_results (
                    id UUID PRIMARY KEY,
                    filename TEXT,
                    analysis TEXT,
                    correlation_id TEXT
                )
                """)
            )
            insert_stmt = """
            INSERT INTO image_results (id, filename, analysis, correlation_id)
            VALUES (:id, :filename, :analysis, :correlation_id)
            """
            await session.execute(
                text(insert_stmt),
                {
                    "id": uuid.uuid4(),
                    "filename": filename,
                    "analysis": analysis,
                    "correlation_id": correlation_id,
                },
            )
            await session.commit()
        # In a real system you would publish a notification to another queue or WebSocket
        print(f"Processed image {filename}, correlation_id={correlation_id}")

async def main() -> None:
    connection = await aio_pika.connect_robust(
        os.getenv("RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672/"),
    )
    channel = await connection.channel()
    queue = await channel.declare_queue("image_processing", durable=True)
    await queue.consume(process_image, no_ack=False)
    print("[worker] Listening for image_processing messages...")
    # Keep the loop running
    await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())
