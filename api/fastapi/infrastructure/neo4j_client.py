import os
from neo4j import AsyncGraphDatabase

NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "terraiqpass")


class Neo4jClient:
    def __init__(self):
        # FIX #7: Use lazy initialization — do NOT connect at import time.
        # The driver is created on first use, so importing this module does not
        # require a live Neo4j instance (important for testing and cold starts).
        self._driver = None

    @property
    def driver(self):
        if self._driver is None:
            self._driver = AsyncGraphDatabase.driver(
                NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD)
            )
        return self._driver

    async def close(self):
        if self._driver is not None:
            await self._driver.close()
            self._driver = None

    async def init_schema(self):
        """
        Creates the True Enterprise Knowledge Graph schema.
        Maps the physical and financial reality of the agricultural business.
        """
        queries = [
            "CREATE CONSTRAINT IF NOT EXISTS FOR (f:Farm) REQUIRE f.id IS UNIQUE",
            "CREATE CONSTRAINT IF NOT EXISTS FOR (f:Field) REQUIRE f.id IS UNIQUE",
            "CREATE CONSTRAINT IF NOT EXISTS FOR (c:Crop) REQUIRE c.id IS UNIQUE",
            "CREATE CONSTRAINT IF NOT EXISTS FOR (m:Machine) REQUIRE m.id IS UNIQUE",
            "CREATE CONSTRAINT IF NOT EXISTS FOR (e:Employee) REQUIRE e.id IS UNIQUE",
            "CREATE CONSTRAINT IF NOT EXISTS FOR (w:Warehouse) REQUIRE w.id IS UNIQUE",
            "CREATE CONSTRAINT IF NOT EXISTS FOR (c:Contract) REQUIRE c.id IS UNIQUE",
        ]
        async with self.driver.session() as session:
            for query in queries:
                await session.run(query)
            print("Neo4j Domain Model Schema initialized.")

    async def get_farm_topology(self, farm_id: str):
        """
        Retrieves the entire structural graph of a farm (Fields, Crops, Warehouses, Contracts).
        """
        query = """
        MATCH (farm:Farm {id: $farm_id})-[:HAS_FIELD]->(field:Field)
        OPTIONAL MATCH (field)-[:GROWS]->(crop:Crop)
        OPTIONAL MATCH (farm)-[:OWNS]->(machine:Machine)
        OPTIONAL MATCH (farm)-[:HAS_CONTRACT]->(contract:Contract)
        RETURN field.id AS field_id, field.area AS area, crop.type AS crop_type,
               machine.type AS machine_type, contract.value AS contract_value
        """
        async with self.driver.session() as session:
            result = await session.run(query, farm_id=farm_id)
            records = await result.data()
            return records

    async def get_warehouse_inventory(self, farm_id: str):
        """
        Retrieves the warehouse inventory for a specific farm.
        """
        query = """
        MATCH (farm:Farm {id: $farm_id})-[:OWNS]->(w:Warehouse)
        RETURN w.id AS warehouse_id, w.crop_type AS crop_type, w.quantity_tons AS quantity_tons
        """
        async with self.driver.session() as session:
            result = await session.run(query, farm_id=farm_id)
            records = await result.data()
            return records


neo4j_client = Neo4jClient()
