from alembic import op
import sqlalchemy as sa

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
