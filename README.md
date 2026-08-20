# TerraIQ — Global Commodity Intelligence & Web3 Settlement Platform

> AI-native decision-intelligence layer for **commodity trading, agriculture, trade finance, logistics and risk**. LangGraph agent orchestration on a FastAPI core, with a Next.js executive dashboard and a RabbitMQ worker fleet.

---

## What is TerraIQ

TerraIQ is an operating/intelligence platform that turns raw market, operational, financial and compliance data into **one actionable recommendation per query**. A LangGraph orchestrator routes every question to the right specialist agent, each agent pulls live data from its domain source (Open-Meteo, Qdrant, Neo4j, ClickHouse, AgriNexus.Law), and a strategy node fuses the results — including resolving agent conflicts — before emitting a final recommendation.

Beyond analysis, TerraIQ automates the **full trade lifecycle**: from a B2B inquiry to a verified deal to a Web3 smart-contract escrow settlement (kontor21, USDC milestone payments).

This is **not a CRUD SaaS**. It is a decision engine: domain models, orchestrator, simulation engine, RAG and knowledge graph sit at the core; screens, CRM and integrations wrap around that core.

---

## Architecture

```
                       TerraIQ (monorepo)
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
   frontend/             api/fastapi/           event/worker/
   Next.js 16            FastAPI + LangGraph    RabbitMQ consumer
   React 19 / Tailwind4   (the real core)       (image processing)
   i18n EN/BG             │                     └→ Postgres
        │              ┌───┴──────────┐
        │              │              │
        │         AI orchestration    Infrastructure clients
        │         orchestrator.py     neo4j / qdrant / clickhouse
        │         8 agents + router   kafka / agrinexus / shadownet
        │         strategy + Kafka    weather / market ingestion
        │              │
        └──────────────┼──────────────────────────┐
                       │                          │
                  Decisions                  External systems
              (final_recommendation)       Open-Meteo · Stripe
                                          AgriNexus.Law · kontor21
```

### Decision flow

```
user query
   └─► router_node        (LLM picks relevant agents)
         └─► parallel fan-out (LangGraph Send)
               ├─ finance    → Neo4j farm/counterparty graph
               ├─ risk       → Open-Meteo live weather
               ├─ market     → Qdrant RAG + ShadowNet competitor data
               ├─ operations → ClickHouse machine telemetry
               ├─ compliance → AgriNexus.Law regulatory RAG (ДФЗ/ОСП)
               ├─ sales      → Neo4j inventory + B2B contract draft
               └─ execution  → Web3 / USDC milestone escrow plan
         └─► strategy        (synthesize, resolve conflicts, emit)
               └─► Kafka topic `strategic_recommendations`
```

### Repo layout

```
TerraIQ/
├─ frontend/
│  ├─ next-app/          # Next.js 16 executive dashboard (EN/BG i18n)
│  └─ react-native-app/  # Expo mobile companion (Dashboard/Markets/Trades)
├─ api/
│  └─ fastapi/           # FastAPI core + LangGraph orchestration
│     ├─ main.py             # App entry, routers, /orchestrate, /metrics
│     ├─ orchestrator.py     # ⭐ LangGraph state machine (8 agents + strategy)
│     ├─ domain_models.py    # Pydantic domain contracts
│     ├─ models.py           # API request/response models
│     ├─ data_foundation.py  # Data-source registry, agent mesh, demos
│     ├─ simulation_engine.py# Digital Twin "what-if" simulator
│     ├─ verification.py     # Deal compliance verifier (sanctions, wallets)
│     ├─ bootstrap.py        # Idempotent DDL self-bootstrap
│     ├─ alembic/            # Migrations (rag_audit, image_results, crm, billing)
│     ├─ infrastructure/     # neo4j, qdrant, clickhouse, kafka, agrinexus, shadownet, seed_data, ingestion
│     └─ routers/            # markets, intelligence, execution, crm, image, payments, rag
├─ ai/                     # Python facade layer (re-exports api/fastapi)
│  ├─ langgraph/           #   app_graph, run_orchestrator, workflow
│  ├─ rag/                 #   RAGEngine (Qdrant) + regulatory KB facade
│  ├─ knowledge_graph/     #   KnowledgeGraphEngine (Neo4j)
│  ├─ agent_memory/        #   placeholder
│  └─ langchain/           #   placeholder
├─ event/
│  └─ worker/              # RabbitMQ consumer microservice (image → GPT-4o → Postgres)
├─ docs/                   # Architecture, roadmap, deployment checklists
├─ docker-compose.yml      # 9-service local infra + app
├─ render.yaml             # Render production topology
└─ start_terraiq.ps1/.bat  # Local bootloader
```

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 · React 19 · TypeScript · Tailwind v4 · Framer Motion · i18next (EN/BG) · lucide-react |
| Mobile | Expo (React Native) — dashboard, markets, escrow tabs |
| Backend | Python 3.12 · FastAPI · SQLAlchemy · Alembic |
| Orchestration | LangGraph · LangChain (ChatOpenAI gpt-4o) |
| Vector DB / RAG | Qdrant |
| Knowledge graph | Neo4j |
| Telemetry | ClickHouse |
| Events | Kafka (`strategic_recommendations`) |
| Job queue | RabbitMQ (`image_processing`) + aio-pika worker |
| Payments | Stripe Checkout (start/business/enterprise) |
| Settlement | kontor21 Web3 escrow (USDC milestones) |
| Observability | OpenTelemetry · Prometheus (`/metrics`) |
| Data sources | Open-Meteo (weather) · exchangerate-api (FX) · AgriNexus.Law (regulatory RAG) · ShadowNet (competitor intel, optional) |

---

## Databases

| Store | Purpose | Schema management |
|---|---|---|
| Postgres/PostGIS | System of record: `crm_inquiries`, `image_results`, `rag_audit`, `billing_events` | Alembic (`api/fastapi/alembic/`) + idempotent bootstrap on startup |
| Neo4j | Enterprise knowledge graph (farms, fields, crops, warehouses, counterparties) | Seeded by `infrastructure/seed_data.py` |
| Qdrant | Market knowledge embeddings for RAG | Seeded by `infrastructure/seed_data.py` |
| ClickHouse | IoT/machine telemetry (MergeTree) | Seeded by `infrastructure/seed_data.py` |
| Redis | Cache/state | — |

The DB schema lives **in the Python backend** (Alembic migrations + `bootstrap.py`), not in the frontend. There is no Prisma schema in this project.

---

## Environment variables

Copy `.env.example` to `.env` (root) and/or `api/fastapi/.env` as needed. Required for a full run:

| Variable | Purpose | Required |
|---|---|---|
| `OPENAI_API_KEY` | LLM for all agents + Vision worker | Yes |
| `OPENAI_MODEL` | Model name (default `gpt-4o`) | — |
| `DATABASE_URL` | Postgres (SQLAlchemy) | For CRM/verification/billing |
| `NEO4J_URI` / `NEO4J_USER` / `NEO4J_PASSWORD` | Knowledge graph | For finance/sales agents |
| `QDRANT_URL` | Vector DB | For market agent |
| `CLICKHOUSE_HOST` / `USER` / `PASSWORD` / `DB` | Telemetry | For operations agent |
| `KAFKA_BROKER_URL` | Event stream | For strategy output |
| `RABBITMQ_URL` | Job queue | For image upload/worker |
| `REDIS_URL` | Cache | — |
| `CORS_ORIGINS` | Allowed frontend origins | Yes |
| `FRONTEND_BASE_URL` | Redirect/callback base | — |
| `TERRAIQ_ADMIN_USER` / `TERRAIQ_ADMIN_PASSWORD` | Admin gate (`/admin`) | For admin panel |
| `STRIPE_API_KEY` / `STRIPE_WEBHOOK_SECRET` / `STRIPE_*_PRICE_ID` | Subscriptions | For payments |
| `MAX_IMAGE_UPLOAD_BYTES` | Upload cap (default 5 MiB) | — |
| `AGRINEXUS_LAW_BASE_URL` | Compliance RAG base (default `https://www.agrinexuslaw.com`) | — |

All external integrations **fail soft**: if a datasource is unreachable, agents return explicit fallback strings instead of crashing, so the orchestrator stays usable in any environment.

---

## Running locally

### Option A — Docker Compose (full stack)

Requires Docker. The API needs `OPENAI_API_KEY` exported before `up`:

```bash
export OPENAI_API_KEY=sk-...
docker compose up --build
```

Then:

- Frontend: http://localhost:3000
- API docs: http://localhost:8000/docs
- Neo4j browser: http://localhost:7474 (neo4j/terraiqpass)
- RabbitMQ management: http://localhost:15672 (guest/guest)
- n8n: http://localhost:5678

Compose starts 9 services: `postgres`, `redis`, `kafka`, `rabbitmq`, `neo4j`, `qdrant`, `clickhouse`, `n8n`, plus the `fastapi`, `frontend` and `worker` app containers.

### Option B — Manual (Windows bootloader)

```powershell
.\start_terraiq.ps1
```

Or step by step:

```bash
# 1. Infrastructure
docker compose up -d postgres redis kafka rabbitmq neo4j qdrant clickhouse

# 2. Python backend
cd api/fastapi
python -m venv venv
venv\Scripts\activate            # (Windows)  · source venv/bin/activate (Linux/mac)
pip install -r requirements.txt
python infrastructure/seed_data.py   # seed Neo4j, ClickHouse, Qdrant
uvicorn main:app --reload --port 8000

# 3. Frontend
cd frontend/next-app
npm install
npm run dev                       # http://localhost:3000

# 4. Event worker (optional)
cd event/worker
pip install -r requirements.txt
python worker.py
```

---

## Testing

Backend tests live in `api/fastapi/` and use plain `unittest`/`pytest`-style scripts:

| Test | Covers |
|---|---|
| `test_agents.py` | LangGraph agent flow, Neo4j + Kafka triggers |
| `test_strategy.py` | Strategy node synthesis & conflict resolution |
| `test_qdrant.py` | Qdrant search + ingest |
| `test_orchestrator_stress.py` | Orchestrator under repeated load |

Run from `api/fastapi/`:

```bash
python run_pytest.py          # or: pytest -q
python test_orchestrator_stress.py
```

---

## Deployment

Production topology is defined in `render.yaml` (region: Frankfurt):

- **terraiq-api** — Docker from `api/fastapi` (health check `/health`). Requires the full env set (OpenAI, Postgres, Redis, Qdrant, Neo4j, ClickHouse, Kafka, RabbitMQ, Stripe).
- **terraiq-web** — Docker from `frontend/next-app`, custom domain `terraiq.me` / `www.terraiq.me`. `NEXT_PUBLIC_API_URL` points at the API service.

Each service has its own `Dockerfile`; the root `Dockerfile` is context-resilient (works whether Render builds from the repo root or the service dir).

The frontend also deploys to Vercel (`frontend/next-app/vercel.json`); the `src/app/api/ai` route keeps the LLM call server-side so the key is never shipped to the browser.

---

## Security

- **API keys** never reach the browser: LLM calls run in FastAPI or in Next.js server routes (`/api/ai`, `/api/auth`).
- **Admin gate** protects `/admin` via a signed cookie (currently static-HMAC; being upgraded to a claims-based token with `sub`/`iat`/`exp`/`jti`/`role`).
- **Deal verification** (`api/fastapi/verification.py`) runs deterministic checks — price-vs-market benchmark, quantity sanity, EIP-55 wallet format, counterparty history, sanctions keyword screen — plus an LLM verdict (APPROVE/REVIEW/REJECT) before any escrow is auto-created.
- **CORS** restricted to configured origins; **HTTP-only, SameSite cookies** for auth.
- Kafka producer is explicitly closed on shutdown (no resource leaks); event emits are non-blocking.

---

## Capability status

Not everything on the marketing surface is equal. Live signals:

| Capability | Status |
|---|---|
| LangGraph orchestration (8 agents + strategy) | LIVE |
| Weather risk (Open-Meteo) | LIVE |
| Market RAG (Qdrant) + competitor intel (ShadowNet) | LIVE |
| Knowledge graph (Neo4j) | LIVE |
| Operations telemetry (ClickHouse) | LIVE |
| Regulatory RAG (AgriNexus.Law / local ДФЗ–ОСП KB) | LIVE (local fallback KB) |
| CRM inquiries → AI deal verification | LIVE |
| Stripe subscriptions | LIVE |
| RabbitMQ image-processing worker | LIVE (basic Vision analysis) |
| Web3 escrow (kontor21, USDC milestones) | BETA (propose/confirm endpoints, mock in places) |
| Long-horizon forecasting (6–24 months) | PLANNED (marketing claim — not yet production-proven) |
| Automated dispute resolution | PLANNED |
| Decision Memory / agent memory | BETA (placeholder `agent_memory/`) |

> ⚠️ The landing page makes bold product claims (smart-contract escrow, USDC settlement, automated dispute resolution, 6–24-month forecasts). Some are implemented (escrow endpoints, USDC plan generation); others are aspirational. Treat the BETA/PLANNED rows as roadmap, not delivered guarantees.

---

## Project history

- `ORIGINAL_REQUEST.md` — genesis spec: Finance Agent first, Neo4j context, Kafka emit, then Risk/Market/Operations agents + intelligent routing (all implemented).
- `PROJECT.md` — Milestone 1 scope + interface contracts.
- `docs/` — `TERRAIQ_2027_ARCHITECTURE.md` (target architecture), `ROADMAP_PHASE_5_10.md`, `VERCEL_PRODUCTION_CHECKLIST.md`.

---

© 2026 AgriNexus. All rights reserved. Contact: info@agrinexus.eu
