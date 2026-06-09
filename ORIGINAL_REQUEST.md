# Original User Request

## 2026-06-06T20:39:49Z

Develop the backend microservices and AI agent logic for **TerraIQ**, an AI-Native Enterprise Platform for Agriculture, expanding upon the existing FastAPI, LangGraph, Kafka, and Neo4j infrastructure.

Working directory: `C:\Users\expre\.gemini\antigravity\scratch\terraiQ`
Integrity mode: development

## Requirements

### R1. Sequential Implementation
The agent team must implement the AI agents sequentially. You must start with the **Finance Agent**. Do not begin work on the Risk Agent or others until the Finance Agent is fully implemented and tested.

### R2. Knowledge Graph Integration
The Finance Agent must be modified in `api/fastapi/orchestrator.py` to dynamically query the Neo4j database (via `api/fastapi/infrastructure/neo4j_client.py`) to gather real farm context (e.g., fields, crops, area) before generating its analysis. 

### R3. Event-Driven Output
When the LangGraph orchestrator produces a final recommendation, it must emit a Kafka event representing the strategic decision using the `api/fastapi/infrastructure/kafka_client.py`.

### R4. Test Automation
Create a test script `test_agents.py` that programmatically tests the Finance Agent's execution flow, ensuring it calls Neo4j and triggers the Kafka producer.

## Acceptance Criteria

### Implementation Quality
- [ ] The LangGraph state machine successfully routes to the Finance Agent.
- [ ] The Finance Agent's tool explicitly executes a Cypher query via `Neo4jClient`.
- [ ] The orchestrator successfully produces an event to the `strategic_recommendations` Kafka topic.

### Verification
- [ ] `python test_agents.py` runs without throwing exceptions.
- [ ] The test script verifies that the Kafka `emit_event` function was called during execution.

## 2026-06-07T00:57:41+03:00

Develop and integrate the remaining 3 LangGraph AI Agents (Risk Agent, Market Agent, and Operations Agent) into the TerraIQ AI-Native Enterprise Platform, connecting them to their respective Big Data layers.

Working directory: `C:\Users\expre\.gemini\antigravity\scratch\terraiQ`
Integrity mode: development

## Requirements

### R1. Risk Agent Implementation
Implement the Risk Agent in `orchestrator.py`. It should focus on climate and credit risk. 
It MUST integrate with a real external weather API (e.g., Open-Meteo API, which does not require an API key) to pull live meteorological data for its risk assessments.

### R2. Market Agent Implementation (RAG)
Implement the Market Agent. It must connect to the **Qdrant** Vector Database to perform RAG (Retrieval-Augmented Generation) on agricultural regulations and market trends.

### R3. Operations Agent Implementation (IoT)
Implement the Operations Agent. It must query the **ClickHouse** database (using `clickhouse_client.py`) to analyze machine telemetry and optimize logistics.

### R4. Orchestrator Routing
Update the main LangGraph state machine so the orchestrator can intelligently route complex questions to the correct specialized agent (or all of them).

## Acceptance Criteria

### Implementation Quality
- [ ] The `orchestrator.py` successfully defines and registers all 3 new agents.
- [ ] The Market agent contains logic to search Qdrant vectors.
- [ ] The Operations agent contains logic to execute analytical queries on ClickHouse.

### Verification
- [ ] Expand the `test_agents.py` script to include programmatic tests for the Risk, Market, and Operations agents.
- [ ] `python test_agents.py` runs without throwing exceptions.
