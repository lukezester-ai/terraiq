import sys
import os
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
import asyncio
from langchain_core.messages import AIMessage

# Mock OpenAIEmbeddings before import
import hashlib

def dummy_embed_query(*args, **kwargs):
    text = args[-1] if args else kwargs.get("text", "")
    h = hashlib.md5(str(text).encode("utf-8")).digest()
    return [b / 255.0 for b in h] * 96

@pytest.fixture(autouse=True)
def mock_openai_embeddings():
    patcher = patch("langchain_openai.OpenAIEmbeddings.embed_query", side_effect=dummy_embed_query)
    patcher.start()
    yield
    patcher.stop()

@pytest.fixture(autouse=True)
def reset_qdrant_singleton():
    original_api_key = os.environ.get("OPENAI_API_KEY")
    os.environ["OPENAI_API_KEY"] = "dummy_key"
    original_sys_path = sys.path[:]
    
    from infrastructure.qdrant_client import qdrant_client
    from qdrant_client import QdrantClient
    
    original_client = qdrant_client.client
    original_initialized = qdrant_client._initialized
    original_embeddings = qdrant_client.embeddings
    
    qdrant_client._initialized = False
    qdrant_client.client = QdrantClient(":memory:")
    qdrant_client.embeddings = None
    
    yield
    
    qdrant_client.client = original_client
    qdrant_client._initialized = original_initialized
    qdrant_client.embeddings = original_embeddings
    
    sys.path[:] = original_sys_path
    if original_api_key is not None:
        os.environ["OPENAI_API_KEY"] = original_api_key
    else:
        os.environ.pop("OPENAI_API_KEY", None)


async def custom_mock_ainvoke(prompt, *args, **kwargs):
    prompt_str = str(prompt)
    if "Synthesize the following analyses" in prompt_str:
        return AIMessage(content="Mocked LLM recommendation")
    elif "Extract latitude and longitude" in prompt_str:
        return AIMessage(content="52.52,13.41")
    elif "Analyze risk" in prompt_str and "Weather context: Current temperature is" in prompt_str:
        return AIMessage(content="Mocked Risk Analysis")
    elif "market analysis" in prompt_str and "Market data found." in prompt_str:
        return AIMessage(content="Mocked Market Analysis")
    elif "operational analysis" in prompt_str and "Machine health:" in prompt_str:
        return AIMessage(content="Mocked Operations Analysis")
    elif "financial analysis" in prompt_str:
        return AIMessage(content="Mocked Finance Analysis")
    elif "B2B sales strategy" in prompt_str:
        return AIMessage(content="Mocked Sales Analysis with Contract")
    return AIMessage(content="Mocked Default Analysis")

@pytest.mark.asyncio
async def test_run_orchestrator_finance_only():
    from orchestrator import run_orchestrator
    with patch("orchestrator.neo4j_client.get_farm_topology", new_callable=AsyncMock) as mock_get_farm_topology, \
         patch("orchestrator.emit_event", new_callable=AsyncMock) as mock_emit_event, \
         patch("orchestrator.ChatOpenAI.ainvoke", new_callable=AsyncMock) as mock_ainvoke, \
         patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_httpx_get, \
         patch("orchestrator.clickhouse_client.get_machine_health") as mock_clickhouse, \
         patch("orchestrator.qdrant_client.search_market_data") as mock_qdrant_search:
        
        mock_get_farm_topology.return_value = [{"field_name": "Field A", "crop_name": "Wheat", "area": 100}]
        mock_ainvoke.side_effect = custom_mock_ainvoke
        
        result = await run_orchestrator(query="Tell me about my finance", farm_id="farm_1")
        
        mock_get_farm_topology.assert_called_once_with("farm_1")
        mock_emit_event.assert_called_once()
        
        assert mock_ainvoke.call_count == 2
        
        print(f"\n--- FINANCE ONLY RESULTS ---")
        print(f"Agents Activated: {result.get('next_agents')}")
        print(f"Finance Analysis: {result.get('finance_analysis')}")
        print(f"Final Strategy: {result.get('final_recommendation')}")

@pytest.mark.asyncio
async def test_run_orchestrator_all_agents():
    from orchestrator import run_orchestrator
    from infrastructure.qdrant_client import qdrant_client
    
    with patch("orchestrator.neo4j_client.get_farm_topology", new_callable=AsyncMock) as mock_get_farm_topology, \
         patch("orchestrator.emit_event", new_callable=AsyncMock) as mock_emit_event, \
         patch("orchestrator.ChatOpenAI.ainvoke", new_callable=AsyncMock) as mock_ainvoke, \
         patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_httpx_get, \
         patch("orchestrator.clickhouse_client.get_machine_health") as mock_clickhouse, \
         patch.object(qdrant_client, "search_market_data", wraps=qdrant_client.search_market_data) as mock_qdrant_search:
        
        mock_get_farm_topology.return_value = [{"field_name": "Field A", "crop_name": "Wheat", "area": 100}]
        mock_ainvoke.side_effect = custom_mock_ainvoke
        
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"current_weather": {"temperature": 25.0}}
        mock_httpx_get.return_value = mock_response
        
        # ClickHouse execute returns tuples
        mock_clickhouse.return_value = [(90.0, 10.0)]
        
        qdrant_client.ingest_market_data(["Market data found."])
        
        result = await run_orchestrator(query="finance risk market operations", farm_id="farm_1")
        
        mock_get_farm_topology.assert_called_once_with("farm_1")
        mock_emit_event.assert_called_once()
        mock_httpx_get.assert_called_once()
        mock_clickhouse.assert_called_once()
        mock_qdrant_search.assert_called_once()
        mock_httpx_get.assert_called_once_with("https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current_weather=true")
        mock_clickhouse.assert_called_once_with(farm_id="farm_1", machine_id="tractor_1")
        mock_qdrant_search.assert_called_once_with(query="finance risk market operations", limit=1)
        
        print(f"\n--- FULL SIMULATION RESULTS ---")
        print(f"Agents Activated: {result.get('next_agents')}")
        print(f"Risk Analysis: {result.get('risk_analysis')}")
        print(f"Market Analysis: {result.get('market_analysis')}")
        print(f"Operations Analysis: {result.get('operations_analysis')}")
        print(f"Finance Analysis: {result.get('finance_analysis')}")
        print(f"Final Strategy: {result.get('final_recommendation')}")

@pytest.mark.asyncio
async def test_run_orchestrator_sales_only():
    from orchestrator import run_orchestrator
    with patch("orchestrator.neo4j_client.get_warehouse_inventory", new_callable=AsyncMock) as mock_inventory, \
         patch("orchestrator.agrinexus_client.draft_b2b_contract", new_callable=AsyncMock) as mock_contract, \
         patch("orchestrator.emit_event", new_callable=AsyncMock) as mock_emit_event, \
         patch("orchestrator.ChatOpenAI.ainvoke", new_callable=AsyncMock) as mock_ainvoke:
        
        mock_inventory.return_value = [{"warehouse_id": "wh_1", "crop_type": "Wheat", "quantity_tons": 500}]
        mock_contract.return_value = "https://agrinexuslaw.com/api/contracts/view/mock123"
        mock_ainvoke.side_effect = custom_mock_ainvoke
        
        result = await run_orchestrator(query="We want to buy wheat", farm_id="farm_1")
        
        mock_inventory.assert_called_once_with("farm_1")
        mock_contract.assert_called_once()
        mock_emit_event.assert_called_once()
        
        print(f"\n--- SALES ONLY RESULTS ---")
        print(f"Agents Activated: {result.get('next_agents')}")
        print(f"Sales Analysis: {result.get('sales_analysis')}")
        print(f"Final Strategy: {result.get('final_recommendation')}")

if __name__ == "__main__":
    async def run_tests():
        print("Running tests...")
        
        original_api_key = os.environ.get("OPENAI_API_KEY")
        os.environ["OPENAI_API_KEY"] = "dummy_key"
        original_sys_path = sys.path[:]
        
        from infrastructure.qdrant_client import qdrant_client
        from qdrant_client import QdrantClient
        
        patcher = patch("langchain_openai.OpenAIEmbeddings.embed_query", side_effect=dummy_embed_query)
        patcher.start()
        
        original_client = qdrant_client.client
        original_initialized = qdrant_client._initialized
        original_embeddings = qdrant_client.embeddings
        
        try:
            qdrant_client._initialized = False
            qdrant_client.client = QdrantClient(":memory:")
            qdrant_client.embeddings = None
            await test_run_orchestrator_finance_only()
            
            qdrant_client._initialized = False
            qdrant_client.client = QdrantClient(":memory:")
            qdrant_client.embeddings = None
            await test_run_orchestrator_all_agents()
            
            qdrant_client._initialized = False
            qdrant_client.client = QdrantClient(":memory:")
            qdrant_client.embeddings = None
            await test_run_orchestrator_sales_only()
            print("Tests passed successfully!")
        finally:
            qdrant_client.client = original_client
            qdrant_client._initialized = original_initialized
            qdrant_client.embeddings = original_embeddings
            patcher.stop()
            sys.path[:] = original_sys_path
            
            if original_api_key is not None:
                os.environ["OPENAI_API_KEY"] = original_api_key
            else:
                os.environ.pop("OPENAI_API_KEY", None)
            
    asyncio.run(run_tests())
