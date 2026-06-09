# Project: TerraIQ Agents Integration
# Scope: Milestone 1

## Architecture
- LangGraph Orchestrator managing multiple agents (Finance, Risk, Market, Operations).
- External Integrations: Open-Meteo API (Risk), Qdrant Vector DB (Market), ClickHouse (Operations).

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Integrate Remaining Agents | Implement Risk, Market, and Operations agents in orchestrator.py, update routing, update test_agents.py | none | DONE |

## Interface Contracts
### orchestrator ↔ agents
- `AgentState`: Dictionary with keys for `farm_id`, `query`, analyses, and `final_recommendation`.
- Agents return partial states with their specific analysis keys updated.

## Code Layout
- `api/fastapi/orchestrator.py`: State graph and agent nodes.
- `api/fastapi/test_agents.py`: Unit and integration testing for the graph.
- `api/fastapi/infrastructure/`: Connectors for Neo4j, Kafka, ClickHouse, etc.
