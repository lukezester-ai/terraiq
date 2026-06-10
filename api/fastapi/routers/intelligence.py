from fastapi import APIRouter

from data_foundation import (
    build_digital_twin_snapshot,
    build_executive_snapshot,
    get_agent_mesh,
    get_autonomous_workflows,
    get_data_fabric,
    get_knowledge_graph_model,
    get_strategic_os,
    get_decision_memory,
    get_mvp_demo_story,
    run_risk_agent_demo,
    run_market_agent_demo,
    get_ai_decision_report,
    run_crisis_simulation,
)

router = APIRouter()


@router.get("/data-fabric")
async def data_fabric():
    return get_data_fabric()


@router.get("/knowledge-graph/model")
async def knowledge_graph_model():
    return get_knowledge_graph_model()


@router.get("/agents/mesh")
async def agents_mesh():
    return get_agent_mesh()


@router.get("/digital-twin/{farm_id}")
async def digital_twin(farm_id: str):
    return build_digital_twin_snapshot(farm_id)


@router.get("/executive/{farm_id}")
async def executive_intelligence(farm_id: str):
    return build_executive_snapshot(farm_id)


@router.get("/autonomous-workflows")
async def autonomous_workflows():
    return get_autonomous_workflows()


@router.get("/roadmap")
async def roadmap():
    return {
        "focus": "Freeze new UI and build the data foundation.",
        "phases": [
            "Phase 5: Enterprise Data Foundation",
            "Phase 6: Real Knowledge Graph",
            "Phase 7: Agent Mesh",
            "Phase 8: Real Digital Twin",
            "Phase 9: Executive Intelligence",
            "Phase 10: Autonomous Workflows",
        ],
        "immediate_priorities": [
            "Neo4j domain model",
            "Risk Agent",
            "Market Agent",
            "Strategy Agent",
            "Real Data Ingestion Layer",
            "Event Driven Workflows",
            "Digital Twin Engine v1",
        ],
    }


@router.get("/strategic-os")
async def strategic_os():
    return get_strategic_os()


@router.get("/decision-memory")
async def decision_memory():
    return get_decision_memory()


@router.get("/mvp-demo")
async def mvp_demo():
    return get_mvp_demo_story()


@router.get("/agents/risk/demo")
async def risk_agent_demo():
    return run_risk_agent_demo()


@router.get("/agents/market/demo")
async def market_agent_demo():
    return run_market_agent_demo()


@router.get("/decision-report/demo")
async def decision_report_demo():
    return get_ai_decision_report()


@router.post("/crisis-simulation/run")
async def crisis_simulation_run():
    return await run_crisis_simulation()
