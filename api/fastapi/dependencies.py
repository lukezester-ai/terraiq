import os
from functools import lru_cache
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
import redis.asyncio as aioredis
from openai import OpenAI

# Database URL – read from env (set in docker-compose)
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg2://terraiq:terraiqpass@localhost:5432/terraiqdb")
engine = create_engine(DATABASE_URL, echo=False, future=True)
SessionLocal = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=engine))

@lru_cache()
def get_redis():
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    return aioredis.from_url(redis_url)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_llm():
    # OpenAI client – expects OPENAI_API_KEY env variable
    return OpenAI()

# FastAPI dependency wrappers
async def get_redis_async():
    return get_redis()

async def get_llm_async():
    return get_llm()
