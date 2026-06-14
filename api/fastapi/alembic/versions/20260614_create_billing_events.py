from alembic import op
import sqlalchemy as sa

revision = "20260614_create_billing_events"
down_revision = "20260614_create_crm_inquiries"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "billing_events",
        sa.Column("id", sa.String(length=255), primary_key=True),
        sa.Column("event_type", sa.String(length=255), nullable=False),
        sa.Column("payload", sa.JSON, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_billing_events_event_type", "billing_events", ["event_type"])


def downgrade():
    op.drop_index("ix_billing_events_event_type", table_name="billing_events")
    op.drop_table("billing_events")
