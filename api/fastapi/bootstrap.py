from sqlalchemy import text

# Idempotent DDL mirroring alembic/versions/*.py so the app self-bootstraps
# on any runtime (Vercel serverless has no reliable pre-deploy migration hook).
SCHEMA_STATEMENTS = [
    """
    CREATE TABLE IF NOT EXISTS crm_inquiries (
        id VARCHAR(64) PRIMARY KEY,
        client_name VARCHAR(255) NOT NULL,
        client_email VARCHAR(255) NOT NULL,
        requested_crop VARCHAR(120) NOT NULL,
        quantity_tons INTEGER NOT NULL,
        destination VARCHAR(255) NOT NULL,
        additional_notes TEXT NOT NULL DEFAULT '',
        status VARCHAR(64) NOT NULL DEFAULT 'Processing',
        orchestrator_result JSON NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
    """,
    "CREATE INDEX IF NOT EXISTS ix_crm_inquiries_created_at ON crm_inquiries (created_at)",
    "CREATE INDEX IF NOT EXISTS ix_crm_inquiries_client_email ON crm_inquiries (client_email)",
]


def ensure_schema(engine):
    """Create required tables/indexes if they do not exist. Safe to run on every startup."""
    with engine.connect() as conn:
        for statement in SCHEMA_STATEMENTS:
            conn.execute(text(statement))
        conn.commit()
