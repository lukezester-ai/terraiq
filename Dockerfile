FROM python:3.12-slim

WORKDIR /app

COPY . /app/

# If built from root directory context (Root Directory = .), move api/fastapi/* up into /app/
RUN if [ -d "/app/api/fastapi" ] && [ -f "/app/api/fastapi/requirements.txt" ]; then \
        cp -r /app/api/fastapi/* /app/ && rm -rf /app/api; \
    fi

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8000

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
