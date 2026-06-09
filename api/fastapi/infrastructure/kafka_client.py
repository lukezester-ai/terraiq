import os
import json
from aiokafka import AIOKafkaProducer

KAFKA_BROKER_URL = os.getenv("KAFKA_BROKER_URL", "localhost:9092")

# Global producer instance
producer: AIOKafkaProducer = None

async def get_kafka_producer() -> AIOKafkaProducer:
    global producer
    if producer is None:
        producer = AIOKafkaProducer(
            bootstrap_servers=KAFKA_BROKER_URL,
            value_serializer=lambda v: json.dumps(v).encode('utf-8')
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
    This triggers background agents or Digital Twin simulations.
    """
    p = await get_kafka_producer()
    await p.send_and_wait(topic, event_data)
    print(f"Event emitted to {topic}: {event_data}")
