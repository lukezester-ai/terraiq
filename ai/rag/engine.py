import sys
import os

api_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../api/fastapi"))
if api_path not in sys.path:
    sys.path.insert(0, api_path)

from infrastructure.qdrant_client import qdrant_client, QdrantMarketClient


class RAGEngine:
    """Facade for TerraIQ Retrieval-Augmented Generation (RAG) capabilities using Qdrant vector database."""

    def __init__(self, client: QdrantMarketClient = qdrant_client):
        self.client = client

    def search_market_insights(self, query: str, limit: int = 3):
        return self.client.search_market_data(query, limit=limit)

    def ingest_knowledge(self, texts: list[str]):
        return self.client.ingest_market_data(texts)


rag_engine = RAGEngine()
