import sys
import os

os.environ["OPENAI_API_KEY"] = "dummy_key"
os.environ["QDRANT_URL"] = "dummy_url"

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from unittest.mock import patch
patcher = patch("langchain_openai.OpenAIEmbeddings.embed_query", return_value=[0.1]*1536)
patcher.start()

try:
    from api.fastapi.orchestrator import run_orchestrator
    print("Import successful")
except Exception as e:
    print(f"Import failed: {type(e).__name__} - {e}")
