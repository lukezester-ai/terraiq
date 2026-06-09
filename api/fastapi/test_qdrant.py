import asyncio
from unittest.mock import patch
import os

patcher = patch("langchain_openai.OpenAIEmbeddings.embed_query", return_value=[0.1]*1536)
patcher.start()

from infrastructure.qdrant_client import qdrant_client

def test_qdrant():
    res = qdrant_client.search_market_data("test query")
    print(res)

if __name__ == "__main__":
    test_qdrant()
