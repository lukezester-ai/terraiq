import json
import httpx
from typing import TypedDict, Annotated, List, Dict, Optional, Sequence
from langgraph.graph import StateGraph, END
from infrastructure.neo4j_client import neo4j_client
from infrastructure.kafka_client import emit_event
from infrastructure.qdrant_client import qdrant_client
from infrastructure.clickhouse_client import clickhouse_client
from infrastructure.agrinexus_client import agrinexus_client
from infrastructure.shadownet_client import shadow_net
from langchain_openai import ChatOpenAI

class AgentState(TypedDict, total=False):
    farm_id: Optional[str]
    query: str
    finance_analysis: str
    risk_analysis: str
    market_analysis: str
    operations_analysis: str
    compliance_analysis: str
    sales_analysis: str
    final_recommendation: str
    next_agents: List[str]

def get_llm():
    return ChatOpenAI(model="gpt-4o-mini")

async def router_node(state: AgentState) -> AgentState:
    print("Routing query...")
    query = state.get("query", "")
    if query is None:
        query = ""
    query = query.lower()
    next_agents = []
    
    if "finance" in query or "money" in query or "cost" in query or "profit" in query:
        next_agents.append("finance")
    if "risk" in query or "climate" in query or "weather" in query:
        next_agents.append("risk")
    if "market" in query or "demand" in query or "price" in query:
        next_agents.append("market")
    if "operation" in query or "logistics" in query or "machine" in query or "tractor" in query:
        next_agents.append("operations")
    if "compliance" in query or "subsidy" in query or "regulation" in query or "law" in query:
        next_agents.append("compliance")
    if "trade" in query or "buy" in query or "sell" in query or "offer" in query or "inquiry" in query:
        next_agents.append("sales")
        
    if not next_agents:
        next_agents = ["finance", "risk", "market", "operations", "compliance", "sales"]
        
    return {"next_agents": next_agents}

async def finance_agent(state: AgentState) -> AgentState:
    print("Finance Agent analyzing...")
    farm_id = state.get("farm_id", "farm_1")
    query = state.get("query", "")
    if query is None:
        query = ""
    
    try:
        farm_topology = await neo4j_client.get_farm_topology(farm_id)
    except Exception as e:
        print(f"Error fetching farm topology: {e}")
        farm_topology = []
    
    prompt = f"Analyze the following query: {query}\nFarm Topology: {farm_topology}\nProvide a financial analysis."
    try:
        llm = get_llm()
        response = await llm.ainvoke(prompt)
        analysis = response.content
    except Exception as e:
        print(f"Error calling LLM in finance_agent: {e}")
        analysis = "Fallback finance analysis: Unable to generate detailed financial insights at this time."
    
    return {"finance_analysis": analysis}

async def risk_agent(state: AgentState) -> AgentState:
    print("Risk Agent analyzing...")
    query = state.get("query", "")
    if query is None:
        query = ""
    try:
        llm = get_llm()
        coord_prompt = f"Extract latitude and longitude from this text. Return only in format 'lat,lon'. If none, return '52.52,13.41'. Text: {query}"
        coord_response = await llm.ainvoke(coord_prompt)
        coords = coord_response.content.strip().split(',')
        if len(coords) == 2:
            lat, lon = coords[0].strip(), coords[1].strip()
        else:
            lat, lon = "52.52", "13.41"
            
        async with httpx.AsyncClient() as client:
            response = await client.get(f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current_weather=true")
            if response.status_code == 200:
                data = response.json()
                temp = data.get("current_weather", {}).get("temperature", "unknown")
                weather_context = f"Current temperature is {temp}C."
            else:
                weather_context = f"Weather API error: {response.status_code}"
                
        prompt = f"Analyze risk for query: {query}. Weather context: {weather_context}."
        analysis_response = await llm.ainvoke(prompt)
        analysis = analysis_response.content
    except Exception as e:
        print(f"Error calling external API in risk_agent: {e}")
        llm = get_llm()
        try:
            analysis = (await llm.ainvoke(f"Provide a risk assessment for: {query}. Note: Weather data unavailable.")).content
        except:
            analysis = "Error generating risk analysis."
        
    return {"risk_analysis": analysis}

async def market_agent(state: AgentState) -> AgentState:
    print("Market Agent analyzing (with ShadowNet Proxies)...")
    query = state.get("query", "")
    if query is None:
        query = ""
    try:
        import asyncio
        results = await asyncio.to_thread(qdrant_client.search_market_data, query=query, limit=1)
        if results:
            context = results[0].payload.get("text", "Market data found.")
        else:
            context = "No market data found."
            
        # --- SHADOWNET INTEGRATION ---
        shadow_net_data = await shadow_net.scrape_competitor_pricing(query)
        context += f"\n[ShadowNet Rotating Proxy Report]: {shadow_net_data}"
        # -----------------------------
            
        llm = get_llm()
        prompt = f"Analyze this query: {query}\nBased on market context and real-time scraped competitor data: {context}\nProvide a highly competitive market analysis."
        response = await llm.ainvoke(prompt)
        analysis = response.content
    except Exception as e:
        print(f"Error in market_agent: {e}")
        llm = get_llm()
        try:
            analysis = (await llm.ainvoke(f"Analyze market conditions for: {query}. (Data unavailable)")).content
        except:
            analysis = "Error generating market analysis."
        
    return {"market_analysis": analysis}

async def operations_agent(state: AgentState) -> AgentState:
    print("Operations Agent analyzing...")
    farm_id = state.get("farm_id", "farm_1")
    query = state.get("query", "")
    if query is None:
        query = ""
    try:
        import asyncio
        health_data = await asyncio.to_thread(clickhouse_client.get_machine_health, farm_id=farm_id, machine_id="tractor_1")
        context = f"Machine health: {health_data}"
        
        llm = get_llm()
        prompt = f"Analyze operations for query: {query}. Health data: {context}. Provide operational analysis."
        response = await llm.ainvoke(prompt)
        analysis = response.content
    except Exception as e:
        print(f"Error calling ClickHouse in operations_agent: {e}")
        llm = get_llm()
        try:
            analysis = (await llm.ainvoke(f"Provide general operational guidance for query: {query}. Machinery data unavailable.")).content
        except:
            analysis = "Error generating operations analysis."
        
    return {"operations_analysis": analysis}

async def compliance_agent(state: AgentState) -> AgentState:
    print("Compliance Agent analyzing...")
    query = state.get("query", "")
    if query is None:
        query = ""
    try:
        llm = get_llm()
        prompt = f"Analyze compliance, EU agricultural regulations, and subsidies for query: {query}."
        response = await llm.ainvoke(prompt)
        analysis = response.content
    except Exception as e:
        print(f"Error calling LLM in compliance_agent: {e}")
        analysis = "Error generating compliance analysis."
        
    return {"compliance_analysis": analysis}

async def sales_agent(state: AgentState) -> AgentState:
    print("Sales Agent analyzing (with ShadowNet Intelligence)...")
    farm_id = state.get("farm_id", "farm_1")
    query = state.get("query", "")
    if query is None:
        query = ""
        
    try:
        inventory = await neo4j_client.get_warehouse_inventory(farm_id)
        if not inventory:
            inventory = [{"crop_type": "Wheat", "quantity_tons": 500}] # Fallback mock
            
        contract_url = await agrinexus_client.draft_b2b_contract("AgriCorp Inc", "Wheat", 500, 320.50)
        
        # --- SHADOWNET INTEGRATION ---
        shadow_net_market_intel = await shadow_net.scrape_competitor_pricing(query)
        # -----------------------------
        
        llm = get_llm()
        prompt = (
            f"Analyze the incoming commercial inquiry: {query}. "
            f"Warehouse Inventory: {inventory}. "
            f"ShadowNet Proxy Intelligence (Competitor Data): {shadow_net_market_intel}. "
            f"Generated Draft Contract URL: {contract_url}\n"
            "You are the Chief Sales Agent. Draft a B2B sales strategy. "
            "Address availability, delivery terms, outsmart competitors based on ShadowNet data, and reference the drafted contract."
        )
        response = await llm.ainvoke(prompt)
        analysis = response.content
    except Exception as e:
        print(f"Error calling LLM or APIs in sales_agent: {e}")
        analysis = "Error generating sales analysis."
        
    return {"sales_analysis": analysis}

async def strategy_agent(state: AgentState) -> AgentState:
    print("Strategy Agent (Executive) synthesizing...")
    query = state.get("query", "")
    if query is None:
        query = ""
    
    prompt = (
        f"Original Query: {query}\n"
        "As the Chief Strategy Agent, synthesize the following expert analyses into a final actionable business recommendation:\n"
        f"Finance: {state.get('finance_analysis', 'N/A')}\n"
        f"Risk: {state.get('risk_analysis', 'N/A')}\n"
        f"Market: {state.get('market_analysis', 'N/A')}\n"
        f"Operations: {state.get('operations_analysis', 'N/A')}\n"
        f"Compliance: {state.get('compliance_analysis', 'N/A')}\n"
        f"Sales/Trade: {state.get('sales_analysis', 'N/A')}\n"
    )
    try:
        llm = get_llm()
        response = await llm.ainvoke(prompt)
        recommendation = response.content
    except Exception as e:
        print(f"Error calling LLM in orchestrator: {e}")
        recommendation = "Fallback recommendation: Based on partial analysis, proceed with caution."
        
    try:
        await emit_event("strategic_recommendations", {"recommendation": recommendation})
    except Exception as e:
        print(f"Error emitting event in orchestrator: {e}")
        
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

def route_agents(state: AgentState) -> Sequence[str]:
    return state.get("next_agents", [])

workflow.set_entry_point("router")

workflow.add_conditional_edges(
    "router",
    route_agents,
    {
        "finance": "finance",
        "risk": "risk",
        "market": "market",
        "operations": "operations",
        "compliance": "compliance",
        "sales": "sales"
    }
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
        "finance_analysis": "",
        "risk_analysis": "",
        "market_analysis": "",
        "operations_analysis": "",
        "final_recommendation": "",
        "next_agents": []
    }
    result = await app_graph.ainvoke(initial_state)
    return result
