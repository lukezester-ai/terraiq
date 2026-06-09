import asyncio
from orchestrator import run_orchestrator

async def main():
    print("==================================================")
    print("      TERRAIQ STRATEGY AGENT EXECUTION TEST       ")
    print("==================================================")
    
    # Query designed to trigger Finance, Risk, Market, and Operations agents
    query = "Analyze the financial risk for farm_alpha considering the current weather, ClickHouse tractor telemetry, and Neo4j financial costs."
    
    print(f"[Input Query]: {query}\n")
    print(">>> Waking up AI Agent Mesh...")
    
    try:
        result = await run_orchestrator(query=query, farm_id="farm_alpha")
        
        print("\n[EXECUTIVE STRATEGY DECISION]:")
        print(result["final_recommendation"])
        
        print("\n[Underlying Expert Analyses]:")
        print(f"Finance : {result.get('finance_analysis', 'N/A')[:100]}...")
        print(f"Risk    : {result.get('risk_analysis', 'N/A')[:100]}...")
        print(f"Market  : {result.get('market_analysis', 'N/A')[:100]}...")
        print(f"Ops     : {result.get('operations_analysis', 'N/A')[:100]}...")
        print(f"Compl.  : {result.get('compliance_analysis', 'N/A')[:100]}...")
        
    except Exception as e:
        print(f"\n[ERROR]: Failed to execute Strategy Agent: {e}")

if __name__ == "__main__":
    asyncio.run(main())
