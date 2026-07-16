FROM python:3.12-slim

WORKDIR /app

# Handle both root directory (.) and service directory (api/fastapi) build contexts
COPY requirements.txt* ./api/fastapi/requirements.txt* /app/
RUN pip install --no-cache-dir -r requirements.txt || pip install --no-cache-dir -r api/fastapi/requirements.txt

COPY . .
RUN if [ -f "api/fastapi/main.py" ]; then cp -r api/fastapi/* /app/; fi

EXPOSE 8000

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
