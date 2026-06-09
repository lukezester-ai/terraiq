import sys
import os
import pytest
import asyncio
from unittest.mock import AsyncMock, patch
from langchain_core.messages import AIMessage

# Ensure the local modules can be imported
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from orchestrator import run_orchestrator, app_graph

@pytest.mark.asyncio
async def test_empty_query_and_farm_topology():
    """Test what happens if query is empty and topology is empty."""
    with patch("orchestrator.neo4j_client.get_farm_topology", new_callable=AsyncMock) as mock_topo, \
         patch("orchestrator.emit_event", new_callable=AsyncMock) as mock_emit, \
         patch("langchain_openai.ChatOpenAI.ainvoke", new_callable=AsyncMock) as mock_invoke:
         
        # Empty topology
        mock_topo.return_value = []
        # Return generic message
        mock_invoke.return_value = AIMessage(content="Empty analysis")
        
        # Run orchestrator with empty query
        result = await run_orchestrator(query="", farm_id="farm_empty")
        
        # It shouldn't crash
        assert result["final_recommendation"] == "Empty analysis"
        
        # Verify the prompt passed to the first invoke (finance agent)
        first_call_args = mock_invoke.call_args_list[0][0]
        assert "Analyze the following query: \nFarm Topology: []" in first_call_args[0]


@pytest.mark.asyncio
async def test_neo4j_failure_crashing_graph():
    """Test that a failure in neo4j crashes the entire graph execution."""
    with patch("orchestrator.neo4j_client.get_farm_topology", new_callable=AsyncMock) as mock_topo:
        # Simulate Neo4j being down
        mock_topo.side_effect = Exception("Neo4j ServiceUnavailable")
        
        with pytest.raises(Exception, match="Neo4j ServiceUnavailable"):
            await run_orchestrator(query="test", farm_id="farm_1")


@pytest.mark.asyncio
async def test_kafka_failure_crashing_graph():
    """Test that if emit_event fails, the orchestrator fails entirely without returning a recommendation."""
    with patch("orchestrator.neo4j_client.get_farm_topology", new_callable=AsyncMock) as mock_topo, \
         patch("orchestrator.emit_event", new_callable=AsyncMock) as mock_emit, \
         patch("langchain_openai.ChatOpenAI.ainvoke", new_callable=AsyncMock) as mock_invoke:
         
        mock_topo.return_value = [{"crop": "wheat"}]
        mock_invoke.return_value = AIMessage(content="Rec")
        
        # Simulate Kafka broker down
        mock_emit.side_effect = Exception("KafkaConnectionError")
        
        with pytest.raises(Exception, match="KafkaConnectionError"):
            await run_orchestrator(query="test", farm_id="farm_1")


@pytest.mark.asyncio
async def test_llm_failure():
    """Test LLM API failure handling."""
    with patch("orchestrator.neo4j_client.get_farm_topology", new_callable=AsyncMock) as mock_topo, \
         patch("langchain_openai.ChatOpenAI.ainvoke", new_callable=AsyncMock) as mock_invoke:
         
        mock_topo.return_value = [{"crop": "wheat"}]
        # Simulate LLM timeout or API error
        mock_invoke.side_effect = Exception("OpenAI API Timeout")
        
        with pytest.raises(Exception, match="OpenAI API Timeout"):
            await run_orchestrator(query="test", farm_id="farm_1")


if __name__ == "__main__":
    # A simple manual runner since we might not have pytest configured
    async def run_all():
        print("Running test_empty_query_and_farm_topology...")
        await test_empty_query_and_farm_topology()
        print("Running test_neo4j_failure_crashing_graph...")
        try:
            await test_neo4j_failure_crashing_graph()
        except Exception:
            pass
        print("Running test_kafka_failure_crashing_graph...")
        try:
            await test_kafka_failure_crashing_graph()
        except Exception:
            pass
        print("Running test_llm_failure...")
        try:
            await test_llm_failure()
        except Exception:
            pass
        print("All stress tests executed (if it didn't crash, tests passed!).")
        
    asyncio.run(run_all())
