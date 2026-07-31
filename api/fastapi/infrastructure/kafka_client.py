import os
import json
from aiokafka import AIOKafkaProducer

# Kafka is OPTIONAL. When KAFKA_BROKER_URL is not set or points to a local
# dev placeholder (localhost / 127.0.0.1), event emission is skipped instead
# of trying to connect to a broker that does not exist (e.g. Vercel serverless).
KAFKA_BROKER_URL = os.getenv("KAFKA_BROKER_URL") or None
if KAFKA_BROKER_URL and (
    KAFKA_BROKER_URL.startswith("localhost")
    or KAFKA_BROKER_URL.startswith("127.0.0.1")
):
    KAFKA_BROKER_URL = None

# Global producer instance
producer: AIOKafkaProducer = None

async def get_kafka_producer() -> AIOKafkaProducer:
    global producer
    if KAFKA_BROKER_URL is None:
        return None
    if producer is None:
        producer = AIOKafkaProducer(
            bootstrap_servers=KAFKA_BROKER_URL,
            value_serializer=lambda v: json.dumps(v).encode('utf-8'),
            connect_timeout_ms=3000,
            request_timeout_ms=5000,
        )
        await producer.start()
    return producer

async def close_kafka_producer():
    global producer
    if producer is not None:
        await producer.stop()
        producer = None

async def emit_event(topic: str, event_data: dict):
    """
    Emit a Domain Event to Kafka.
    No-op (with a log line) when Kafka is not configured.
    """
    p = await get_kafka_producer()
    if p is None:
        print(f"[kafka] KAFKA_BROKER_URL not set — skipping event {topic}: {event_data}")
        return
    await p.send_and_wait(topic, event_data)
    print(f"Event emitted to {topic}: {event_data}")
