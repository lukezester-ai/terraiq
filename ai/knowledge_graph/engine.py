import sys
import os

api_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../api/fastapi"))
if api_path not in sys.path:
    sys.path.insert(0, api_path)

from infrastructure.neo4j_client import neo4j_client, Neo4jClient


class KnowledgeGraphEngine:
    """Facade for TerraIQ Agricultural Knowledge Graph (Neo4j) capabilities."""

    def __init__(self, client: Neo4jClient = neo4j_client):
        self.client = client

    async def get_farm_topology(self, farm_id: str = "farm_1"):
        return await self.client.get_farm_topology(farm_id)

    async def get_warehouse_inventory(self, farm_id: str = "farm_1"):
        return await self.client.get_warehouse_inventory(farm_id)


kg_engine = KnowledgeGraphEngine()
