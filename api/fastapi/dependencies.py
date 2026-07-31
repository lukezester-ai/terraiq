import os
from functools import lru_cache
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
import redis.asyncio as redis_async
from openai import AsyncOpenAI

DATABASE_URL = (
    os.getenv("DATABASE_URL")
    or os.getenv("POSTGRES_URL")
    or os.getenv("DATABASE_URL_NON_POOLING")
    or os.getenv("POSTGRES_URL_NON_POOLING")
    or "postgresql+psycopg2://terraiq:terraiqpass@localhost:5432/terraiqdb"
)
engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = scoped_session(sessionmaker(autoflush=False, bind=engine))

@lru_cache()
def get_redis():
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    return redis_async.from_url(redis_url)

def get_db():
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

def get_llm():
    return AsyncOpenAI()

async def get_redis_async():
    return get_redis()

async def get_llm_async():
    return get_llm()
