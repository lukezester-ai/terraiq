from __future__ import annotations

from enum import Enum
from typing import Any, Literal

from pydantic import BaseModel, Field


class SourceKind(str, Enum):
    external = "external"
    internal = "internal"


class SourceStatus(str, Enum):
    planned = "planned"
    stub = "stub"
    live = "live"


class DataSourceSpec(BaseModel):
    name: str
    kind: SourceKind
    domain: str
    status: SourceStatus = SourceStatus.planned
    target_store: Literal["clickhouse", "neo4j", "qdrant", "postgres", "lake", "kafka"]
    freshness_sla_minutes: int | None = None
    event_topic: str
    notes: str


class GraphNodeSpec(BaseModel):
    label: str
    key: str = "id"
    required_properties: list[str] = Field(default_factory=list)


class GraphRelationshipSpec(BaseModel):
    start: str
    relationship: str
    end: str
    description: str


class AgentSpec(BaseModel):
    name: str
    responsibility: str
    data_dependencies: list[str]
    emits: list[str]
    human_approval_required: bool = False


class DigitalTwinSignal(BaseModel):
    name: str
    value: str | float | int
    unit: str | None = None
    source: str
    confidence: float = Field(ge=0, le=1)


class ExecutiveMetric(BaseModel):
    label: str
    value: str
    state: Literal["healthy", "watch", "risk"]
    explanation: str


class RecommendedAction(BaseModel):
    title: str
    priority: Literal["high", "medium", "low"]
    owner_agent: str
    reason: str
    approval_required: bool = True


class ExecutiveIntelligenceSnapshot(BaseModel):
    farm_id: str
    expected_profit: ExecutiveMetric
    risk: ExecutiveMetric
    cash_flow: ExecutiveMetric
    recommended_actions: list[RecommendedAction]
    signals: list[DigitalTwinSignal]
    data_quality: dict[str, Any]


class StrategicCapability(BaseModel):
    name: str
    purpose: str
    required_data: list[str]
    output: str
    trust_metric: str | None = None


class DecisionMemoryRecord(BaseModel):
    id: str
    recommendation: str
    decision_date: str
    approved: bool
    expected_impact: str
    actual_impact: str | None = None
    outcome_status: Literal["pending", "positive", "neutral", "negative"] = "pending"
    linked_agents: list[str] = Field(default_factory=list)
