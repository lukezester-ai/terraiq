from __future__ import annotations

from infrastructure.kafka_client import emit_event

from domain_models import (
    AgentSpec,
    DataSourceSpec,
    DigitalTwinSignal,
    ExecutiveIntelligenceSnapshot,
    ExecutiveMetric,
    GraphNodeSpec,
    GraphRelationshipSpec,
    RecommendedAction,
    SourceKind,
    SourceStatus,
)


DATA_FABRIC_SOURCES: list[DataSourceSpec] = [
    DataSourceSpec(
        name="Open-Meteo Weather",
        kind=SourceKind.external,
        domain="weather",
        status=SourceStatus.live,
        target_store="clickhouse",
        freshness_sla_minutes=60,
        event_topic="external.weather.observation.v1",
        notes="Feeds Risk Agent for weather-related commodity disruptions.",
    ),
    DataSourceSpec(
        name="Satellite Imagery",
        kind=SourceKind.external,
        domain="satellite",
        status=SourceStatus.planned,
        target_store="lake",
        freshness_sla_minutes=1440,
        event_topic="external.satellite.scene.v1",
        notes="NDVI, crop stress, field conditions, tanker tracking.",
    ),
    DataSourceSpec(
        name="Commodity Exchanges",
        kind=SourceKind.external,
        domain="market",
        status=SourceStatus.stub,
        target_store="qdrant",
        freshness_sla_minutes=30,
        event_topic="external.market.price.v1",
        notes="Agriculture + energy + metals: CBOT, LME, ICE, DCE, Euronext, SHFE.",
    ),
    DataSourceSpec(
        name="Energy Markets",
        kind=SourceKind.external,
        domain="market",
        status=SourceStatus.stub,
        target_store="clickhouse",
        freshness_sla_minutes=15,
        event_topic="external.energy.price.v1",
        notes="Brent, WTI, natural gas (TTF, JKM), gasoil, bunker fuel, carbon (EUA).",
    ),
    DataSourceSpec(
        name="Metals & Mining",
        kind=SourceKind.external,
        domain="market",
        status=SourceStatus.stub,
        target_store="clickhouse",
        freshness_sla_minutes=30,
        event_topic="external.metals.price.v1",
        notes="LME copper, aluminium, zinc, nickel; gold, silver, iron ore, steel rebar.",
    ),
    DataSourceSpec(
        name="FX & Rates",
        kind=SourceKind.external,
        domain="finance",
        status=SourceStatus.stub,
        target_store="clickhouse",
        freshness_sla_minutes=5,
        event_topic="external.fx.rate.v1",
        notes="Major FX pairs, EM FX, interest rate swaps, government bond yields, SOFR, EURIBOR.",
    ),
    DataSourceSpec(
        name="Credit & Structured Products",
        kind=SourceKind.external,
        domain="finance",
        status=SourceStatus.planned,
        target_store="neo4j",
        freshness_sla_minutes=1440,
        event_topic="external.credit.spread.v1",
        notes="CDS spreads, trade finance rates, repo rates, structured commodity finance.",
    ),
    DataSourceSpec(
        name="Shipping & Logistics",
        kind=SourceKind.external,
        domain="operations",
        status=SourceStatus.stub,
        target_store="clickhouse",
        freshness_sla_minutes=60,
        event_topic="external.shipping.freight.v1",
        notes="BDI, tanker rates, container rates, port congestion, vessel tracking (AIS).",
    ),
    DataSourceSpec(
        name="Sanctions & Regulations",
        kind=SourceKind.external,
        domain="compliance",
        status=SourceStatus.stub,
        target_store="qdrant",
        freshness_sla_minutes=1440,
        event_topic="external.compliance.sanctions.v1",
        notes="OFAC, EU sanctions, UN embargoes, export controls, restricted parties.",
    ),
    DataSourceSpec(
        name="Geopolitical Intelligence",
        kind=SourceKind.external,
        domain="risk",
        status=SourceStatus.planned,
        target_store="qdrant",
        freshness_sla_minutes=60,
        event_topic="external.geopolitical.event.v1",
        notes="Conflict monitoring, trade policy, corridor closures, sanctions updates.",
    ),
    DataSourceSpec(
        name="Fertilizer & Inputs",
        kind=SourceKind.external,
        domain="inputs",
        status=SourceStatus.stub,
        target_store="clickhouse",
        freshness_sla_minutes=1440,
        event_topic="external.inputs.fertilizer_price.v1",
        notes="Urea, DAP, potash, crop protection. Global reference prices.",
    ),
    DataSourceSpec(
        name="On-Chain Market Data",
        kind=SourceKind.external,
        domain="market",
        status=SourceStatus.planned,
        target_store="clickhouse",
        freshness_sla_minutes=5,
        event_topic="external.onchain.prices.v1",
        notes="Chainlink oracles, DEX commodity pools, on-chain FX, tokenized commodity prices.",
    ),
    DataSourceSpec(
        name="Counterparty Network",
        kind=SourceKind.internal,
        domain="sales",
        status=SourceStatus.stub,
        target_store="neo4j",
        freshness_sla_minutes=1440,
        event_topic="internal.counterparty.profile.v1",
        notes="Entity graph: verified traders, credit tiers, trade history, KYC status.",
    ),
    DataSourceSpec(
        name="Inventory & Storage",
        kind=SourceKind.internal,
        domain="inventory",
        status=SourceStatus.stub,
        target_store="neo4j",
        freshness_sla_minutes=60,
        event_topic="internal.inventory.level.v1",
        notes="Global inventory positions: warehouses, tanks, silos, anchored vessels.",
    ),
    DataSourceSpec(
        name="Web3 Settlement",
        kind=SourceKind.internal,
        domain="execution",
        status=SourceStatus.stub,
        target_store="postgres",
        freshness_sla_minutes=5,
        event_topic="internal.execution.escrow.v1",
        notes="kontor21 smart contract escrow states, USDC settlements, dispute records.",
    ),
]


GRAPH_NODES: list[GraphNodeSpec] = [
    GraphNodeSpec(label="Counterparty", required_properties=["id", "name", "credit_tier", "jurisdiction"]),
    GraphNodeSpec(label="Trade", required_properties=["id", "commodity", "quantity", "price", "delivery_date"]),
    GraphNodeSpec(label="Contract", required_properties=["id", "counterparty", "terms", "value", "currency"]),
    GraphNodeSpec(label="Inventory", required_properties=["id", "commodity", "quantity", "location"]),
    GraphNodeSpec(label="Vessel", required_properties=["id", "imo", "status", "eta"]),
    GraphNodeSpec(label="Port", required_properties=["id", "name", "country", "congestion_level"]),
    GraphNodeSpec(label="Warehouse", required_properties=["id", "capacity_tons", "current_load"]),
    GraphNodeSpec(label="Escrow", required_properties=["id", "contract_address", "amount", "status", "chain"]),
    GraphNodeSpec(label="Legacy_Farm", required_properties=["id", "name", "country"]),
    GraphNodeSpec(label="Legacy_Field", required_properties=["id", "area_ha", "soil_type"]),
]

GRAPH_RELATIONSHIPS: list[GraphRelationshipSpec] = [
    GraphRelationshipSpec(start="Counterparty", relationship="EXECUTED", end="Trade", description="Counterparty has executed this trade."),
    GraphRelationshipSpec(start="Counterparty", relationship="HAS_CONTRACT", end="Contract", description="Active contract with counterparty."),
    GraphRelationshipSpec(start="Trade", relationship="SECURED_BY", end="Escrow", description="Trade is secured by smart contract escrow."),
    GraphRelationshipSpec(start="Trade", relationship="DELIVERS_TO", end="Port", description="Delivery port for this trade."),
    GraphRelationshipSpec(start="Trade", relationship="CARRIED_BY", end="Vessel", description="Vessel assigned to this trade."),
    GraphRelationshipSpec(start="Contract", relationship="SECURED_BY", end="Escrow", description="Contract secured by on-chain USDC escrow."),
    GraphRelationshipSpec(start="Counterparty", relationship="OWNS", end="Inventory", description="Current inventory position."),
    GraphRelationshipSpec(start="Inventory", relationship="STORES_IN", end="Warehouse", description="Stored at this facility."),
    GraphRelationshipSpec(start="Vessel", relationship="DESTINATION", end="Port", description="Vessel destination."),
    GraphRelationshipSpec(start="Legacy_Farm", relationship="HAS_FIELD", end="Legacy_Field", description="Farm operates this field."),
]


AGENT_MESH: list[AgentSpec] = [
    AgentSpec(
        name="Market Agent",
        responsibility="Real-time prices across energy, metals, agriculture, chemicals, FX, and rates.",
        data_dependencies=["Commodity Exchanges", "Energy Markets", "Metals & Mining", "FX & Rates", "On-Chain Market Data"],
        emits=["market.signal.created", "market.opportunity.detected"],
    ),
    AgentSpec(
        name="Risk Agent",
        responsibility="Market risk, credit risk, geopolitical risk, sanctions risk, and operational risk.",
        data_dependencies=["Weather", "Geopolitical Intelligence", "Sanctions & Regulations", "Shipping & Logistics"],
        emits=["risk.score.changed", "risk.alert.created"],
    ),
    AgentSpec(
        name="Finance Agent",
        responsibility="Hedging, structured products, FX exposure, financing, and margin analysis.",
        data_dependencies=["FX & Rates", "Credit & Structured Products", "On-Chain Market Data"],
        emits=["finance.hedge.updated", "finance.cashflow.warning"],
    ),
    AgentSpec(
        name="Operations Agent",
        responsibility="Shipping logistics, storage, supply chain, vessel tracking, and inventory management.",
        data_dependencies=["Shipping & Logistics", "Inventory & Storage", "Counterparty Network"],
        emits=["operations.bottleneck.detected", "operations.capacity.updated"],
    ),
    AgentSpec(
        name="Compliance Agent",
        responsibility="Sanctions, trade regulations, KYC/AML, export controls, and trade finance compliance.",
        data_dependencies=["Sanctions & Regulations", "Geopolitical Intelligence", "Counterparty Network"],
        emits=["compliance.sanctions.flagged", "compliance.requirement.created"],
    ),
    AgentSpec(
        name="Sales Agent",
        responsibility="B2B trade matching, counterparty discovery, offer generation, and deal structuring.",
        data_dependencies=["Counterparty Network", "Inventory & Storage", "Shipping & Logistics"],
        emits=["sales.deal.proposed", "sales.match.found"],
    ),
    AgentSpec(
        name="Execution Agent",
        responsibility="Smart contract escrow, USDC settlement, milestone payments, and dispute resolution.",
        data_dependencies=["Web3 Settlement", "Counterparty Network"],
        emits=["execution.escrow.created", "execution.settlement.completed"],
        human_approval_required=True,
    ),
    AgentSpec(
        name="Strategy Agent",
        responsibility="Synthesizes all agents into decisions and recommended actions with Web3 execution plan.",
        data_dependencies=["Market Agent", "Risk Agent", "Finance Agent", "Operations Agent", "Compliance Agent", "Sales Agent", "Execution Agent"],
        emits=["strategy.recommendation.created", "workflow.approval.requested"],
        human_approval_required=True,
    ),
]


def get_data_fabric() -> dict:
    return {
        "phase": "Phase 5: Enterprise Data Foundation",
        "sources": DATA_FABRIC_SOURCES,
        "next_build_order": [
            "weather",
            "commodity_prices",
            "fx_rates",
            "warehouses",
            "accounting",
            "machine_telemetry",
            "satellite",
        ],
    }


def get_knowledge_graph_model() -> dict:
    return {
        "phase": "Phase 6: Real Knowledge Graph",
        "nodes": GRAPH_NODES,
        "relationships": GRAPH_RELATIONSHIPS,
    }


def get_agent_mesh() -> dict:
    return {
        "phase": "Phase 7: Agent Mesh",
        "agents": AGENT_MESH,
        "strategy": "All specialized agents feed Strategy Agent; Strategy Agent creates decisions, not dashboards.",
    }


def build_digital_twin_snapshot(farm_id: str) -> dict:
    signals = [
        DigitalTwinSignal(name="cultivated_area", value=1200, unit="ha", source="ERP planned", confidence=0.55),
        DigitalTwinSignal(name="expected_yield", value=6.2, unit="t/ha", source="Yield model v1 planned", confidence=0.42),
        DigitalTwinSignal(name="wheat_reference", value=220, unit="EUR/t", source="Market stub", confidence=0.35),
        DigitalTwinSignal(name="machine_availability", value="watch", source="Machine telemetry stub", confidence=0.4),
    ]
    return {
        "phase": "Phase 8: Real Digital Twin",
        "farm_id": farm_id,
        "signals": signals,
        "engine_status": "contract_ready_data_pending",
        "recalculation_events": [
            "external.weather.observation.v1",
            "external.market.price.v1",
            "internal.machine.telemetry.v1",
            "internal.warehouse.inventory.v1",
            "internal.accounting.transaction.v1",
        ],
    }


def build_executive_snapshot(farm_id: str) -> ExecutiveIntelligenceSnapshot:
    return ExecutiveIntelligenceSnapshot(
        farm_id=farm_id,
        expected_profit=ExecutiveMetric(
            label="Expected Profit",
            value="EUR 4.8M",
            state="healthy",
            explanation="Target executive KPI; must be calculated from real contracts, costs, inventory and market data.",
        ),
        risk=ExecutiveMetric(
            label="Risk",
            value="LOW",
            state="healthy",
            explanation="Target risk state; becomes real when weather, market and liquidity feeds are live.",
        ),
        cash_flow=ExecutiveMetric(
            label="Cash Flow",
            value="HEALTHY",
            state="healthy",
            explanation="Target cash-flow state; requires accounting and receivables ingestion.",
        ),
        recommended_actions=[
            RecommendedAction(
                title="Connect real warehouse inventory before trade automation",
                priority="high",
                owner_agent="Operations Agent",
                reason="Sales and Strategy agents need trusted available tonnage before proposing deals.",
            ),
            RecommendedAction(
                title="Promote market ingestion from stub to live provider",
                priority="high",
                owner_agent="Market Agent",
                reason="Price-sensitive recommendations require current commodity, FX, fertilizer and fuel data.",
            ),
            RecommendedAction(
                title="Build fertilizer price drop workflow",
                priority="medium",
                owner_agent="Strategy Agent",
                reason="This proves autonomous workflow value with human approval before purchase order creation.",
            ),
        ],
        signals=[
            DigitalTwinSignal(name="data_foundation", value="in_progress", source="TerraIQ roadmap", confidence=0.8),
            DigitalTwinSignal(name="agent_mesh", value="defined", source="FastAPI contract", confidence=0.75),
            DigitalTwinSignal(name="digital_twin", value="v1_contract", source="FastAPI contract", confidence=0.55),
        ],
        data_quality={
            "real_data_connected": False,
            "demo_or_stub_data_present": True,
            "blocking_gap": "Live ingestion and internal data connectors are the current priority.",
        },
    )


def get_autonomous_workflows() -> dict:
    return {
        "phase": "Phase 10: Autonomous Workflows",
        "templates": [
            {
                "name": "fertilizer_price_drop_to_purchase_proposal",
                "trigger": "external.inputs.fertilizer_price.v1",
                "steps": [
                    "Market Agent detects price drop",
                    "Risk Agent checks timing and agronomic exposure",
                    "Finance Agent calculates cash-flow impact",
                    "Strategy Agent creates recommendation",
                    "Human approval required",
                    "Purchase order integration hook",
                ],
            },
            {
                "name": "grain_offer_to_contract_draft",
                "trigger": "internal.warehouse.inventory.v1 + external.market.price.v1",
                "steps": [
                    "Market Agent finds demand/price window",
                    "Operations Agent confirms available inventory",
                    "Finance Agent calculates margin",
                    "Compliance Agent checks contract constraints",
                    "Strategy Agent proposes deal",
                    "Human approval required",
                ],
            },
        ],
    }


STRATEGIC_OS_CAPABILITIES = [
    {
        "name": "Decision Memory",
        "purpose": "Store every recommendation, approval, rejected action, result and financial impact so TerraIQ can measure its own decision quality.",
        "required_data": ["recommendations", "approvals", "market outcomes", "accounting results", "yield results"],
        "output": "decision performance ledger",
        "trust_metric": "percent_of_recommendations_that_improved_profit",
    },
    {
        "name": "Board Room AI",
        "purpose": "Investment-grade analysis for land purchases, expansion, debt, leases and machinery.",
        "required_data": ["cash flow", "credit", "rent", "market history", "asset performance"],
        "output": "board-level investment memo",
        "trust_metric": "capital_decision_roi_accuracy",
    },
    {
        "name": "Contract Intelligence",
        "purpose": "Analyze leases, supply contracts, insurance, finance terms and risky clauses using the AgrinexusLaw advantage.",
        "required_data": ["contracts", "deadlines", "counterparties", "payment terms", "legal clauses"],
        "output": "contract risk register",
        "trust_metric": "prevented_contract_risk_value",
    },
    {
        "name": "Executive Copilot",
        "purpose": "Weekly executive briefing that says what matters now, not generic chat.",
        "required_data": ["contracts", "weather", "markets", "machines", "cash flow", "tasks"],
        "output": "weekly executive briefing",
        "trust_metric": "critical_items_detected_before_deadline",
    },
    {
        "name": "Benchmark Engine",
        "purpose": "Compare farm, field, crop and cost performance against region and top percentile.",
        "required_data": ["yield", "cost", "region", "crop", "season", "peer benchmarks"],
        "output": "performance gap analysis",
        "trust_metric": "identified_margin_gap",
    },
    {
        "name": "Scenario Engine",
        "purpose": "Model conservative, realistic and aggressive futures with profit, risk and cash-flow impact.",
        "required_data": ["market prices", "yield assumptions", "costs", "contracts", "weather risk"],
        "output": "scenario comparison",
        "trust_metric": "forecast_error_by_scenario",
    },
    {
        "name": "Capital Allocation Engine",
        "purpose": "Rank the best use of the next capital tranche by expected return, risk and timing.",
        "required_data": ["investment options", "cash flow", "debt capacity", "ROI history", "risk"],
        "output": "ranked capital allocation plan",
        "trust_metric": "realized_roi_vs_recommended_roi",
    },
    {
        "name": "Enterprise Document Brain",
        "purpose": "RAG over contracts, invoices, subsidies, reports and correspondence.",
        "required_data": ["documents", "OCR", "metadata", "entities", "vector index"],
        "output": "document intelligence search and answers",
        "trust_metric": "answer_traceability_to_source_documents",
    },
    {
        "name": "Predictive Cash Flow",
        "purpose": "Forecast inventory, revenue, loans, obligations and working capital 6-24 months forward.",
        "required_data": ["accounting", "contracts", "inventory", "loans", "market scenarios"],
        "output": "cash-flow forecast and warnings",
        "trust_metric": "cash_forecast_accuracy",
    },
    {
        "name": "Multi-Company Management",
        "purpose": "Manage several companies, cooperatives and entities as one agricultural operating group.",
        "required_data": ["entities", "ownership", "intercompany transactions", "contracts", "assets"],
        "output": "group-level operating view",
        "trust_metric": "consolidated_group_visibility",
    },
]


DECISION_MEMORY_SAMPLE = {
    "summary": {
        "total_recommendations": 247,
        "profit_improving_rate": "81%",
        "measured_impact": "+BGN 180,000 sample outcome",
        "status": "contract_ready_data_pending",
    },
    "records": [
        {
            "id": "dm_2026_wheat_sell_october",
            "recommendation": "Sell wheat in October instead of immediately after harvest.",
            "decision_date": "2026-08-20",
            "approved": True,
            "expected_impact": "+BGN 120,000 to +BGN 200,000",
            "actual_impact": "+BGN 180,000",
            "outcome_status": "positive",
            "linked_agents": ["Market Agent", "Risk Agent", "Finance Agent", "Strategy Agent"],
        }
    ],
}


def get_strategic_os() -> dict:
    return {
        "product_name": "TerraIQ Strategic Operating System",
        "core_question": "What is the best decision right now?",
        "capabilities": STRATEGIC_OS_CAPABILITIES,
        "moat": [
            "TerraIQ operations and analytics",
            "AgrinexusLaw contract and legal risk intelligence",
            "Market Intelligence signal layer",
            "Decision Memory that measures outcomes over time",
        ],
    }


def get_decision_memory() -> dict:
    return DECISION_MEMORY_SAMPLE


TERRA_HOLDING_SEED = {
    "farm": "Terra Holding",
    "scenario": "12,400 dka farm faces hail risk, wheat price pressure and tightening cash flow.",
    "fields": 18,
    "total_land_dka": 12400,
    "machines": 14,
    "crops": ["wheat", "corn", "sunflower"],
    "expected_revenue_eur": 3800000,
    "cash_reserve_eur": 310000,
    "debt_service_next_90_days_eur": 420000,
    "inventory": {
        "wheat_tons": 3400,
        "corn_tons": 1200,
        "sunflower_tons": 820,
    },
}


MARKET_AGENT_SAMPLE = {
    "wheat_eur_t": {"value": 221, "trend": "down", "change_30d_pct": -4.6},
    "sunflower_eur_t": {"value": 417, "trend": "up", "change_30d_pct": 3.1},
    "corn_eur_t": {"value": 188, "trend": "flat", "change_30d_pct": 0.8},
    "diesel_eur_l": {"value": 1.42, "trend": "up", "change_30d_pct": 5.4},
    "urea_eur_t": {"value": 392, "trend": "down", "change_30d_pct": -7.8},
    "signal": "Fertilizer is favorable, wheat selling pressure is unfavorable, diesel is increasing logistics cost.",
}


RISK_AGENT_SAMPLE = {
    "overall_risk": 72,
    "risk_level": "HIGH",
    "reason": "Expected hail window, wheat price decline and low cash reserve before debt service.",
    "components": {
        "climate_risk": 78,
        "market_risk": 69,
        "operational_risk": 54,
        "financial_risk": 81,
    },
    "recommended_action": "Delay wheat sale, activate insurance review and preserve cash by postponing non-critical machinery purchase.",
}


DIGITAL_TWIN_DEMO = {
    "current_strategy": {
        "profit_eur": 2400000,
        "risk_index": 72,
        "cash_flow": "strained",
    },
    "alternative_strategy": {
        "profit_eur": 2900000,
        "risk_index": 49,
        "cash_flow": "stable",
    },
    "difference_eur": 500000,
    "levers": [
        {"action": "Delay wheat sale until October", "impact": "+3.4% margin"},
        {"action": "Use fertilizer price drop for planned purchase", "impact": "+4.8% input savings"},
        {"action": "Switch Block 12 to sunflower", "impact": "+6.2% field contribution"},
        {"action": "Trigger hail insurance review", "impact": "reduces downside exposure"},
    ],
}


AI_DECISION_REPORT_SAMPLE = {
    "title": "Terra Holding AI Decision Report",
    "executive_summary": "Terra Holding should avoid forced wheat selling, protect downside weather exposure and use the fertilizer price drop to improve 2027 margin.",
    "risk_analysis": RISK_AGENT_SAMPLE,
    "financial_impact": {
        "expected_revenue_eur": 3800000,
        "current_profit_eur": 2400000,
        "alternative_profit_eur": 2900000,
        "expected_uplift_eur": 500000,
        "cash_flow_effect": "Improves 90-day liquidity by reducing immediate capex and delaying low-price sale.",
    },
    "recommended_actions": [
        "Delay wheat sale unless liquidity threshold is breached.",
        "Review hail insurance coverage within 48 hours.",
        "Lock fertilizer quote for 35% of 2027 planned requirement.",
        "Move Block 12 scenario to agronomist approval.",
        "Prepare board-level cash bridge plan for the next 90 days.",
    ],
    "expected_roi": "+20.8% profit improvement versus current strategy",
    "approval": {
        "status": "pending_human_approval",
        "next_step": "Approve strategy package and create tasks for finance, agronomy and legal review.",
    },
}


def get_mvp_demo_story() -> dict:
    return {
        "flow": ["Data", "Analysis", "Risk", "Simulation", "Recommendation", "Action"],
        "seed_farm": TERRA_HOLDING_SEED,
        "market_agent": MARKET_AGENT_SAMPLE,
        "risk_agent": RISK_AGENT_SAMPLE,
        "digital_twin": DIGITAL_TWIN_DEMO,
        "decision_report": AI_DECISION_REPORT_SAMPLE,
    }


def run_risk_agent_demo() -> dict:
    return RISK_AGENT_SAMPLE


def run_market_agent_demo() -> dict:
    return MARKET_AGENT_SAMPLE


def get_ai_decision_report() -> dict:
    return AI_DECISION_REPORT_SAMPLE


async def run_crisis_simulation() -> dict:
    event = {
        "topic": "hailstorm.warning",
        "farm_id": "terra_holding",
        "severity": "high",
        "message": "Hailstorm warning received for Terra Holding operating region.",
    }

    try:
        await emit_event("hailstorm.warning", event)
        event_status = "emitted"
    except Exception as exc:
        event_status = f"not_emitted: {exc}"

    return {
        "status": "completed",
        "event": event,
        "event_status": event_status,
        "flow": [
            "Kafka event: hailstorm.warning",
            "Risk Agent analyzed climate, market, operations and cash-flow risk",
            "Digital Twin simulated expected loss and alternative strategy",
            "Finance Agent calculated profit delta and liquidity effect",
            "Strategy Agent generated approval-ready recommendation",
        ],
        "seed_farm": TERRA_HOLDING_SEED,
        "risk_agent": RISK_AGENT_SAMPLE,
        "market_agent": MARKET_AGENT_SAMPLE,
        "digital_twin": DIGITAL_TWIN_DEMO,
        "decision_report": AI_DECISION_REPORT_SAMPLE,
    }
