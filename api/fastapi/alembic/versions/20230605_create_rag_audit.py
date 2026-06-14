from alembic import op
import sqlalchemy as sa

revision = "20230605_create_rag_audit"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "rag_audit",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("query", sa.Text, nullable=False),
        sa.Column("answer", sa.Text, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )


def downgrade():
    op.drop_table("rag_audit")
