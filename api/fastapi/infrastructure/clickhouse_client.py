import os
from clickhouse_driver import Client

CLICKHOUSE_HOST = os.getenv("CLICKHOUSE_HOST", "localhost")
CLICKHOUSE_USER = os.getenv("CLICKHOUSE_USER", "terraiq")
CLICKHOUSE_PASSWORD = os.getenv("CLICKHOUSE_PASSWORD", "terraiqpass")
CLICKHOUSE_DB = os.getenv("CLICKHOUSE_DB", "telemetry")

class ClickHouseClient:
    def __init__(self):
        # We use a lazy connection to avoid crashing if server isn't up
        self.client = None

    def _connect(self):
        if self.client is None:
            self.client = Client(
                host=CLICKHOUSE_HOST,
                user=CLICKHOUSE_USER,
                password=CLICKHOUSE_PASSWORD,
                database=CLICKHOUSE_DB
            )

    def init_schema(self):
        """
        Creates the table for high-throughput IoT tractor and drone telemetry.
        """
        self._connect()
        query = """
        CREATE TABLE IF NOT EXISTS machine_telemetry (
            timestamp DateTime,
            machine_id String,
            farm_id String,
            fuel_level Float32,
            engine_temp Float32,
            gps_lat Float64,
            gps_lon Float64,
            status String
        ) ENGINE = MergeTree()
        ORDER BY (farm_id, machine_id, timestamp)
        """
        self.client.execute(query)
        print("ClickHouse telemetry schema initialized.")

    def insert_telemetry_batch(self, data: list):
        """
        Insert a massive batch of IoT data points efficiently.
        """
        self._connect()
        self.client.execute('INSERT INTO machine_telemetry VALUES', data)

    def get_machine_health(self, farm_id: str, machine_id: str):
        """
        Analytic query for the Digital Twin to check machine performance.
        """
        self._connect()
        query = """
        SELECT 
            avg(engine_temp) as avg_temp, 
            min(fuel_level) as min_fuel 
        FROM machine_telemetry 
        WHERE farm_id = %(farm_id)s AND machine_id = %(machine_id)s
        """
        return self.client.execute(query, {'farm_id': farm_id, 'machine_id': machine_id})

clickhouse_client = ClickHouseClient()
