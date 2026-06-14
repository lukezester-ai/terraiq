from alembic import op
import sqlalchemy as sa

revision = "20260614_create_crm_inquiries"
down_revision = "20230605_create_image_results"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "crm_inquiries",
        sa.Column("id", sa.String(length=64), primary_key=True),
        sa.Column("client_name", sa.String(length=255), nullable=False),
        sa.Column("client_email", sa.String(length=255), nullable=False),
        sa.Column("requested_crop", sa.String(length=120), nullable=False),
        sa.Column("quantity_tons", sa.Integer, nullable=False),
        sa.Column("destination", sa.String(length=255), nullable=False),
        sa.Column("additional_notes", sa.Text, nullable=False, server_default=""),
        sa.Column("status", sa.String(length=64), nullable=False, server_default="Processing"),
        sa.Column("orchestrator_result", sa.JSON, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_crm_inquiries_created_at", "crm_inquiries", ["created_at"])
    op.create_index("ix_crm_inquiries_client_email", "crm_inquiries", ["client_email"])


def downgrade():
    op.drop_index("ix_crm_inquiries_client_email", table_name="crm_inquiries")
    op.drop_index("ix_crm_inquiries_created_at", table_name="crm_inquiries")
    op.drop_table("crm_inquiries")
