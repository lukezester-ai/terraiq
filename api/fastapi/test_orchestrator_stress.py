import os
import sys
from unittest.mock import AsyncMock, patch

import pytest
from langchain_core.messages import AIMessage

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from orchestrator import run_orchestrator


class FakeLLM:
    def __init__(self, content: str = "Rec", error: Exception | None = None):
        self.content = content
        self.error = error

    async def ainvoke(self, prompt):
        if self.error:
            raise self.error
        return AIMessage(content=self.content)


@pytest.mark.asyncio
async def test_empty_query_and_farm_topology():
    with patch("orchestrator.neo4j_client.get_farm_topology", new_callable=AsyncMock) as mock_topo, \
         patch("orchestrator.emit_event", new_callable=AsyncMock), \
         patch("orchestrator.get_llm", return_value=FakeLLM("Empty analysis")):
        mock_topo.return_value = []

        result = await run_orchestrator(query="", farm_id="farm_empty")

        assert result["final_recommendation"] == "Empty analysis"
        assert "finance" in result["next_agents"]


@pytest.mark.asyncio
async def test_neo4j_failure_returns_fallback_analysis():
    with patch("orchestrator.neo4j_client.get_farm_topology", new_callable=AsyncMock) as mock_topo, \
         patch("orchestrator.emit_event", new_callable=AsyncMock), \
         patch("orchestrator.get_llm", return_value=FakeLLM("Rec")):
        mock_topo.side_effect = Exception("Neo4j ServiceUnavailable")

        result = await run_orchestrator(query="finance risk", farm_id="farm_1")

        assert result["final_recommendation"] == "Rec"
        assert "finance" in result["next_agents"]


@pytest.mark.asyncio
async def test_kafka_failure_does_not_block_recommendation():
    with patch("orchestrator.neo4j_client.get_farm_topology", new_callable=AsyncMock) as mock_topo, \
         patch("orchestrator.emit_event", new_callable=AsyncMock) as mock_emit, \
         patch("orchestrator.get_llm", return_value=FakeLLM("Rec")):
        mock_topo.return_value = [{"crop": "wheat"}]
        mock_emit.side_effect = Exception("KafkaConnectionError")

        result = await run_orchestrator(query="finance", farm_id="farm_1")

        assert result["final_recommendation"] == "Rec"


@pytest.mark.asyncio
async def test_llm_failure_returns_fallback_recommendation():
    with patch("orchestrator.neo4j_client.get_farm_topology", new_callable=AsyncMock) as mock_topo, \
         patch("orchestrator.emit_event", new_callable=AsyncMock), \
         patch("orchestrator.get_llm", return_value=FakeLLM(error=Exception("OpenAI API Timeout"))):
        mock_topo.return_value = [{"crop": "wheat"}]

        result = await run_orchestrator(query="finance", farm_id="farm_1")

        assert "Fallback recommendation" in result["final_recommendation"]
