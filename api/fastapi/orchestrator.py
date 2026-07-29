import json
import asyncio
import os
import httpx
from functools import lru_cache
from typing import TypedDict, List, Optional, Sequence
from langgraph.graph import StateGraph, END
from langgraph.types import Send
from infrastructure.neo4j_client import neo4j_client
from infrastructure.kafka_client import emit_event
from infrastructure.qdrant_client import qdrant_client
from infrastructure.clickhouse_client import clickhouse_client
from infrastructure.agrinexus_client import agrinexus_client
from infrastructure.shadownet_client import shadow_net
from langchain_openai import ChatOpenAI


ROUTER_SYSTEM_PROMPT = """You are the intelligent query router for TerraIQ, an enterprise agricultural AI platform.
Analyze the user's query and determine which specialized agents should process it.

Available agents and their domains:
- finance: Cost analysis, profitability, cash flow, working capital, margins, budget, financial performance
- risk: Climate/weather risk, credit risk, market risk, operational risk, insurance, natural disasters
- market: Commodity prices, market trends, supply/demand, competitor analysis, trade timing, price signals
- operations: Machinery, logistics, field operations, capacity planning, telemetry, equipment
- compliance: EU/Bulgarian agricultural regulations, subsidies (ДФЗ, ОСП), legal compliance, documentation
- sales: B2B trade inquiries, buy/sell offers, contract generation, inventory matching, procurement

Respond ONLY with a valid JSON object containing:
- "agents": list of agent names to activate
- "reasoning": brief explanation

If unclear, include ALL agents."""

FINANCE_SYSTEM_PROMPT = """You are the Chief Finance Agent for TerraIQ.
Analyze margins, cost base, cash flow, working capital, and profitability using the provided farm topology.
Cite specific data sources in your analysis. State assumptions clearly. Provide a confidence level."""

RISK_SYSTEM_PROMPT = """You are the Chief Risk Agent for TerraIQ.
Assess climate risk, market risk, operational risk, and financial risk using real-time weather data when available.
Consider extreme weather, price volatility, machinery downtime, and liquidity risk.
Cite data sources. Flag high-confidence vs low-confidence assessments."""

MARKET_SYSTEM_PROMPT = """You are the Chief Market Agent for TerraIQ.
Analyze commodity prices, market trends, supply/demand dynamics using Qdrant vector search results.
Identify price signals, trading opportunities, and market risks.
Cite your market data sources and competitor intelligence."""

OPERATIONS_SYSTEM_PROMPT = """You are the Chief Operations Agent for TerraIQ.
Analyze machinery health, logistics, field operations using ClickHouse telemetry data.
Identify bottlenecks, maintenance needs, and efficiency improvements.
Cite telemetry sources and confidence levels."""

COMPLIANCE_SYSTEM_PROMPT = """Вие сте главният агент по регулации и съответствие за TerraIQ.
Анализирайте евро/българските селскостопански регулации, субсидии (ДФЗ, ОСП), срокове и документация.
Използвайте контекст от AgriNexus.Law. Цитирайте конкретни документи. Посочете увереност."""

SALES_SYSTEM_PROMPT = """You are the Chief Sales Agent for TerraIQ.
Analyze B2B trade inquiries, match with available inventory, generate sales strategies.
Use warehouse inventory data and competitor intelligence.
Provide actionable recommendations with pricing, delivery terms, and source citations."""

STRATEGY_SYSTEM_PROMPT = """You are the Chief Strategy Agent for TerraIQ.
Synthesize all agent analyses into a single actionable business recommendation.

CONFLICT RESOLUTION:
1. Read all analyses carefully
2. If agents give CONFLICTING advice, explicitly identify the conflict
3. Analyze trade-offs between conflicting positions
4. Recommend a specific resolution with justification

Structure:
- Executive Summary (2-3 sentences)
- Key Findings by Domain
- Conflicts Identified (if any)
- Recommended Resolution
- Confidence Level
- Next Steps"""


class AgentState(TypedDict, total=False):
    farm_id: Optional[str]
    query: str
    router_reasoning: str
    finance_analysis: str
    risk_analysis: str
    market_analysis: str
    operations_analysis: str
    compliance_analysis: str
    sales_analysis: str
    final_recommendation: str
    next_agents: List[str]


# FIX #10: Use @lru_cache to reuse ChatOpenAI instance instead of creating a new one per call
@lru_cache(maxsize=1)
def get_llm():
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    return ChatOpenAI(model=model)


async def router_node(state: AgentState) -> AgentState:
    print("Routing query with LLM...")
    query = state.get("query", "") or ""

    try:
        llm = get_llm()
        response = await llm.ainvoke(
            f"{ROUTER_SYSTEM_PROMPT}\n\nQuery to route: {query}"
        )
        content = response.content.strip()
        if "{" in content:
            json_str = content[content.index("{"):content.rindex("}") + 1]
            parsed = json.loads(json_str)
            next_agents = parsed.get("agents", [])
            reasoning = parsed.get("reasoning", "No reasoning provided")
        else:
            next_agents = []
            reasoning = "Could not parse router response"
        if not next_agents:
            next_agents = ["finance", "risk", "market", "operations", "compliance", "sales"]
        print(f"Router decision: {next_agents} — {reasoning}")
        return {"next_agents": next_agents, "router_reasoning": reasoning}
    except Exception as e:
        print(f"Router error: {e}, falling back to all agents")
        return {
            "next_agents": ["finance", "risk", "market", "operations", "compliance", "sales"],
            "router_reasoning": f"Router error: {e}, using fallback",
        }


async def finance_agent(state: AgentState) -> AgentState:
    print("Finance Agent analyzing...")
    farm_id = state.get("farm_id", "farm_1")
    query = state.get("query", "") or ""

    try:
        farm_topology = await neo4j_client.get_farm_topology(farm_id)
    except Exception as e:
        print(f"Error fetching farm topology: {e}")
        farm_topology = []

    try:
        llm = get_llm()
        response = await llm.ainvoke(
            f"{FINANCE_SYSTEM_PROMPT}\n\nQuery: {query}\nFarm Topology (Neo4j): {farm_topology}\n\nProvide financial analysis with cited sources and confidence level."
        )
        analysis = response.content
    except Exception as e:
        print(f"Error in finance_agent: {e}")
        analysis = "[Fallback] Finance analysis unavailable. [Source: N/A, Confidence: LOW]"

    return {"finance_analysis": analysis}


async def risk_agent(state: AgentState) -> AgentState:
    print("Risk Agent analyzing...")
    query = state.get("query", "") or ""
    weather_context = ""

    try:
        llm = get_llm()
        coord_response = await llm.ainvoke(
            f"Extract latitude and longitude from this text. Return only 'lat,lon'. If none, return '52.52,13.41'.\nText: {query}"
        )
        coords_text = coord_response.content.strip()
        parts = coords_text.split(",")
        lat, lon = (parts[0].strip(), parts[1].strip()) if len(parts) == 2 else ("52.52", "13.41")

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current_weather=true"
            )
            if response.status_code == 200:
                data = response.json()
                temp = data.get("current_weather", {}).get("temperature", "unknown")
                weather_context = f"Current temperature at ({lat},{lon}): {temp}°C [Source: Open-Meteo API]"
            else:
                weather_context = f"Weather API error: HTTP {response.status_code}"

        analysis_response = await llm.ainvoke(
            f"{RISK_SYSTEM_PROMPT}\n\nQuery: {query}\nWeather Data: {weather_context}\n\nProvide risk assessment with source citations and confidence level."
        )
        analysis = analysis_response.content
    except Exception as e:
        print(f"Error in risk_agent: {e}")
        try:
            llm = get_llm()
            analysis = (await llm.ainvoke(
                f"Provide a risk assessment for: {query}. Note: Weather data unavailable. [Source: N/A, Confidence: LOW]"
            )).content
        except Exception:
            analysis = "[Fallback] Error generating risk analysis."

    return {"risk_analysis": analysis}


async def market_agent(state: AgentState) -> AgentState:
    print("Market Agent analyzing...")
    query = state.get("query", "") or ""

    try:
        qdrant_results = await asyncio.to_thread(qdrant_client.search_market_data, query=query, limit=3)
        if qdrant_results:
            context = "\n".join(
                r.payload.get("text", "Market data entry") for r in qdrant_results
            )
            context = f"Market Data (Qdrant):\n{context}"
        else:
            context = "Market Data: No results found in Qdrant."

        competitor_data = await shadow_net.scrape_competitor_pricing(query)
        context += f"\n\nCompetitor Intelligence (ShadowNet):\n{competitor_data}"

        llm = get_llm()
        response = await llm.ainvoke(
            f"{MARKET_SYSTEM_PROMPT}\n\nQuery: {query}\n\n{context}\n\nProvide market analysis with cited sources and confidence level."
        )
        analysis = response.content
    except Exception as e:
        print(f"Error in market_agent: {e}")
        try:
            llm = get_llm()
            analysis = (await llm.ainvoke(
                f"As Chief Market Agent, analyze: {query}. Note: Market data unavailable. [Source: N/A, Confidence: LOW]"
            )).content
        except Exception:
            analysis = "[Fallback] Error generating market analysis."

    return {"market_analysis": analysis}


async def operations_agent(state: AgentState) -> AgentState:
    print("Operations Agent analyzing...")
    farm_id = state.get("farm_id", "farm_1")
    query = state.get("query", "") or ""

    try:
        health_data = await asyncio.to_thread(
            clickhouse_client.get_machine_health, farm_id=farm_id, machine_id="tractor_1"
        )
        context = f"Machine Health Telemetry (ClickHouse): {health_data}"

        llm = get_llm()
        response = await llm.ainvoke(
            f"{OPERATIONS_SYSTEM_PROMPT}\n\nQuery: {query}\n\n{context}\n\nProvide operational analysis with cited sources and confidence level."
        )
        analysis = response.content
    except Exception as e:
        print(f"Error in operations_agent: {e}")
        try:
            llm = get_llm()
            analysis = (await llm.ainvoke(
                f"As Chief Operations Agent, provide guidance for: {query}. Note: Machinery telemetry unavailable. [Source: N/A, Confidence: LOW]"
            )).content
        except Exception:
            analysis = "[Fallback] Error generating operations analysis."

    return {"operations_analysis": analysis}


async def compliance_agent(state: AgentState) -> AgentState:
    print("Compliance Agent analyzing...")
    query = state.get("query", "") or ""

    law_context = await agrinexus_client.fetch_compliance_context(query)

    try:
        llm = get_llm()
        response = await llm.ainvoke(
            f"{COMPLIANCE_SYSTEM_PROMPT}\n\nQuery: {query}\n\nAgriNexus.Law context:\n{law_context}\n\nProvide compliance analysis with cited documents and confidence level."
        )
        analysis = response.content
    except Exception as e:
        print(f"Error in compliance_agent: {e}")
        analysis = (
            f"[Fallback] Compliance analysis unavailable.\n"
            f"AgriNexus.Law context: {law_context[:500]}\n"
            "[Source: AgriNexus.Law, Confidence: PARTIAL]"
        )

    return {"compliance_analysis": analysis}


async def sales_agent(state: AgentState) -> AgentState:
    print("Sales Agent analyzing...")
    farm_id = state.get("farm_id", "farm_1")
    query = state.get("query", "") or ""

    try:
        inventory = await neo4j_client.get_warehouse_inventory(farm_id)
        if not inventory:
            inventory = [{"crop_type": "Wheat", "quantity_tons": 500}]

        contract_url = await agrinexus_client.draft_b2b_contract("AgriCorp Inc", "Wheat", 500, 320.50)
        competitor_market_intel = await shadow_net.scrape_competitor_pricing(query)

        llm = get_llm()
        response = await llm.ainvoke(
            f"{SALES_SYSTEM_PROMPT}\n\nInquiry: {query}\n\nWarehouse Inventory (Neo4j):\n{inventory}\n\nCompetitor Intelligence:\n{competitor_market_intel}\n\nDrafted Contract URL:\n{contract_url}\n\nProvide B2B sales strategy with pricing, delivery terms, and source citations."
        )
        analysis = response.content
    except Exception as e:
        print(f"Error in sales_agent: {e}")
        analysis = "[Fallback] Error generating sales analysis."

    return {"sales_analysis": analysis}


async def strategy_agent(state: AgentState) -> AgentState:
    print("Strategy Agent (Executive) synthesizing with conflict resolution...")
    query = state.get("query", "") or ""

    analyses = []
    for agent_name in ["finance", "risk", "market", "operations", "compliance", "sales"]:
        key = f"{agent_name}_analysis"
        value = state.get(key)
        if value and value.strip():
            analyses.append(f"--- {agent_name.upper()} ANALYSIS ---\n{value}")

    all_analyses = "\n\n".join(analyses) if analyses else "No agent analyses available."

    try:
        llm = get_llm()
        response = await llm.ainvoke(
            f"{STRATEGY_SYSTEM_PROMPT}\n\nOriginal Query: {query}\n\nAgent Analyses:\n{all_analyses}\n\nSynthesize with conflict resolution."
        )
        recommendation = response.content
    except Exception as e:
        print(f"Error in strategy_agent: {e}")
        recommendation = (
            "[Fallback] Strategy synthesis unavailable due to LLM error.\n"
            "Review individual agent analyses above. [Confidence: LOW]"
        )

    try:
        await emit_event("strategic_recommendations", {"recommendation": recommendation})
    except Exception as e:
        print(f"Error emitting event: {e}")

    return {"final_recommendation": recommendation}


workflow = StateGraph(AgentState)

workflow.add_node("router", router_node)
workflow.add_node("finance", finance_agent)
workflow.add_node("risk", risk_agent)
workflow.add_node("market", market_agent)
workflow.add_node("operations", operations_agent)
workflow.add_node("compliance", compliance_agent)
workflow.add_node("sales", sales_agent)
workflow.add_node("strategy", strategy_agent)


# FIX #4: Use Send API for proper parallel fan-out from router to multiple agents
def route_agents(state: AgentState) -> list:
    """Fan out to all selected agents in parallel using LangGraph Send API."""
    return [Send(agent, state) for agent in state.get("next_agents", [])]


workflow.set_entry_point("router")

workflow.add_conditional_edges(
    "router",
    route_agents,
    ["finance", "risk", "market", "operations", "compliance", "sales"],
)

workflow.add_edge("finance", "strategy")
workflow.add_edge("risk", "strategy")
workflow.add_edge("market", "strategy")
workflow.add_edge("operations", "strategy")
workflow.add_edge("compliance", "strategy")
workflow.add_edge("sales", "strategy")

workflow.add_edge("strategy", END)

app_graph = workflow.compile()


async def run_orchestrator(query: str, farm_id: str = "farm_1") -> dict:
    initial_state = {
        "farm_id": farm_id,
        "query": query,
        "router_reasoning": "",
        "finance_analysis": "",
        "risk_analysis": "",
        "market_analysis": "",
        "operations_analysis": "",
        "compliance_analysis": "",
        "sales_analysis": "",
        "final_recommendation": "",
        "next_agents": [],
    }
    result = await app_graph.ainvoke(initial_state)
    return result
