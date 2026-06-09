import os
import sys
from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance, PointStruct

def test_qdrant_corruption():
    client = QdrantClient(":memory:")
    
    # Simulate first thread recreating collection but crashing before upsert
    client.recreate_collection(
        collection_name="market_data",
        vectors_config=VectorParams(size=1536, distance=Distance.COSINE),
    )
    
    # Process "crashes" here, so upsert never happens.
    
    # Now simulate the next run
    try:
        # get_collection should succeed
        col = client.get_collection("market_data")
        print("get_collection succeeded!")
        print(f"Points count: {col.points_count}")
        # But data is missing!
        # If initialized is set to True here, search will return empty results.
        print("This indicates a state corruption vulnerability: initialized is True but database is empty!")
    except Exception as e:
        print(f"get_collection failed: {e}")

if __name__ == "__main__":
    test_qdrant_corruption()
