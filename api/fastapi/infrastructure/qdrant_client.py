import os
import tempfile
from filelock import FileLock
from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance, PointStruct
from langchain_openai import OpenAIEmbeddings

class QdrantMarketClient:
    def __init__(self):
        self.client = None
        self.embeddings = None
        self._initialized = False
        lock_path = os.path.join(tempfile.gettempdir(), "qdrant_market.lock")
        self._lock = FileLock(lock_path)

    def _ensure_collection(self):
        if self._initialized:
            return
        with self._lock:
            if self._initialized:
                return
            if self.client is None:
                qdrant_url = os.getenv("QDRANT_URL")
                if qdrant_url:
                    self.client = QdrantClient(url=qdrant_url)
                else:
                    self.client = QdrantClient(":memory:")
            if self.embeddings is None:
                self.embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
            if not self.client.collection_exists("market_data"):
                try:
                    self.client.create_collection(
                        collection_name="market_data",
                        vectors_config=VectorParams(size=1536, distance=Distance.COSINE),
                    )
                except Exception as e:
                    if "already exists" not in str(e).lower():
                        raise
            
            self._initialized = True

    def ingest_market_data(self, documents):
        self._ensure_collection()
        if not documents:
            return
        
        points = []
        for i, doc in enumerate(documents):
            vector = self.embeddings.embed_query(doc)
            points.append(
                PointStruct(
                    id=i + 1,
                    vector=vector,
                    payload={"text": doc}
                )
            )
        self.client.upsert(
            collection_name="market_data",
            points=points
        )

    def search_market_data(self, query: str, limit=3):
        try:
            self._ensure_collection()
            query_vector = self.embeddings.embed_query(query)
            return self.client.search(
                collection_name="market_data",
                query_vector=query_vector,
                limit=limit
            )
        except Exception as e:
            print(f"Error querying Qdrant: {e}")
            return []

qdrant_client = QdrantMarketClient()
