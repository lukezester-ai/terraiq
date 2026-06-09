import asyncio
import random
from datetime import datetime, timedelta
from neo4j_client import neo4j_client
from clickhouse_client import clickhouse_client

async def seed_neo4j_knowledge_graph():
    print("[Neo4j] Initializing True Enterprise Knowledge Graph...")
    await neo4j_client.init_schema()

    print("[Neo4j] Seeding Farm Topology...")
    
    # 1. Create the Holding Company / Farm
    farm_id = "farm_alpha"
    create_farm = f"MERGE (f:Farm {{id: '{farm_id}', name: 'TerraAlpha Holding', location: 'Sofia Region'}}) RETURN f"
    
    # 2. Create Fields, Crops, Machines, Employees, Warehouses, Contracts
    queries = [
        create_farm,
        # Fields & Crops
        f"MATCH (f:Farm {{id: '{farm_id}'}}) MERGE (f)-[:HAS_FIELD]->(field1:Field {{id: 'f1', area_hectares: 1200, soil_type: 'Chernozem'}}) MERGE (field1)-[:GROWS]->(c1:Crop {{id: 'wheat_1', type: 'Wheat', expected_yield_tons: 4800}})",
        f"MATCH (f:Farm {{id: '{farm_id}'}}) MERGE (f)-[:HAS_FIELD]->(field2:Field {{id: 'f2', area_hectares: 800, soil_type: 'Clay'}}) MERGE (field2)-[:GROWS]->(c2:Crop {{id: 'corn_1', type: 'Corn', expected_yield_tons: 5600}})",
        
        # Financials / Cost Centers
        f"MATCH (f1:Field {{id: 'f1'}}) MERGE (f1)-[:INCURS_COST]->(cost1:Cost {{id: 'cst1', type: 'Fertilizer', amount: 150000, currency: 'EUR'}})",
        f"MATCH (f2:Field {{id: 'f2'}}) MERGE (f2)-[:INCURS_COST]->(cost2:Cost {{id: 'cst2', type: 'Fuel', amount: 80000, currency: 'EUR'}})",
        
        # Machinery
        f"MATCH (f:Farm {{id: '{farm_id}'}}) MERGE (f)-[:OWNS]->(m1:Machine {{id: 'tractor_1', brand: 'John Deere', model: '8R 410', status: 'ACTIVE'}})",
        f"MATCH (f:Farm {{id: '{farm_id}'}}) MERGE (f)-[:OWNS]->(m2:Machine {{id: 'harvester_1', brand: 'Claas', model: 'Lexion 8900', status: 'MAINTENANCE'}})",
        
        # Employees
        f"MATCH (f:Farm {{id: '{farm_id}'}}) MERGE (f)-[:EMPLOYS]->(emp1:Employee {{id: 'emp_1', role: 'Chief Agronomist', salary: 45000}})",
        
        # Warehouses & Contracts
        f"MATCH (f:Farm {{id: '{farm_id}'}}) MERGE (f)-[:HAS_WAREHOUSE]->(w1:Warehouse {{id: 'wh_1', capacity_tons: 10000, current_load: 2500}})",
        f"MATCH (f:Farm {{id: '{farm_id}'}}) MERGE (f)-[:HAS_CONTRACT]->(cnt1:Contract {{id: 'cnt_1', buyer: 'Global Grain Inc.', volume_tons: 3000, strike_price: 245.50}})",
    ]

    async with neo4j_client.driver.session() as session:
        for query in queries:
            await session.run(query)
    
    print("[Neo4j] Enterprise Knowledge Graph Seeded Successfully.")

async def seed_clickhouse_telemetry():
    print("[ClickHouse] Initializing Time-Series Telemetry Table...")
    clickhouse_client.init_db()
    
    print("[ClickHouse] Generating 30 days of high-frequency IoT data...")
    now = datetime.utcnow()
    
    # Generate 5,000 rows of synthetic IoT data for tractor_1
    data_points = []
    current_time = now - timedelta(days=30)
    
    machine_id = "tractor_1"
    farm_id = "farm_alpha"
    
    while current_time < now:
        # Simulate realistic engine behavior
        is_working = random.random() > 0.4
        if is_working:
            temp = random.uniform(85.0, 105.0)  # Normal operating temp
            fuel = random.uniform(10.0, 90.0)
            rpm = random.randint(1500, 2200)
            status = "ACTIVE"
        else:
            temp = random.uniform(20.0, 40.0)   # Idle/Off temp
            fuel = random.uniform(10.0, 90.0)
            rpm = 0
            status = "IDLE"

        # Inject anomalies for the AI to find
        if random.random() < 0.01:
            temp = random.uniform(110.0, 125.0) # Overheating anomaly
            status = "WARNING_OVERHEAT"

        point = {
            "timestamp": current_time,
            "machine_id": machine_id,
            "farm_id": farm_id,
            "engine_temperature": temp,
            "fuel_level": fuel,
            "gps_lat": 42.6977 + random.uniform(-0.1, 0.1),
            "gps_lon": 23.3219 + random.uniform(-0.1, 0.1),
            "status": status
        }
        data_points.append(point)
        current_time += timedelta(minutes=15) # Data point every 15 mins
        
    print(f"[ClickHouse] Writing {len(data_points)} telemetry records...")
    clickhouse_client.insert_telemetry(data_points)
    print("[ClickHouse] Telemetry Seeding Complete.")

async def main():
    print("=== TerraIQ Enterprise Data Seeder ===")
    try:
        await seed_neo4j_knowledge_graph()
        await seed_clickhouse_telemetry()
        print("=== Seeding Finished ===")
    except Exception as e:
        print(f"FATAL ERROR during seeding: {e}")
        print("NOTE: Make sure Docker is running and Neo4j/ClickHouse are accessible.")

if __name__ == "__main__":
    asyncio.run(main())
