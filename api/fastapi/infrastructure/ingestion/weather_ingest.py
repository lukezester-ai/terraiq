import httpx
import asyncio

class WeatherIngestionService:
    """
    Pulls real meteorological data from Open-Meteo for the Risk Agent and Digital Twin.
    """
    def __init__(self):
        self.base_url = "https://api.open-meteo.com/v1/forecast"

    async def fetch_current_weather(self, latitude: float, longitude: float):
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "current": "temperature_2m,precipitation,wind_speed_10m",
            "timezone": "auto"
        }
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(self.base_url, params=params)
                response.raise_for_status()
                data = response.json()
                return {
                    "temperature": data["current"]["temperature_2m"],
                    "precipitation": data["current"]["precipitation"],
                    "wind_speed": data["current"]["wind_speed_10m"]
                }
            except Exception as e:
                print(f"Failed to fetch weather: {e}")
                return None

weather_ingest = WeatherIngestionService()
