from alembic import op
import sqlalchemy as sa

def upgrade():
    op.create_table(
        "image_results",
        sa.Column("id", sa.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("filename", sa.String(length=255), nullable=False),
        sa.Column("analysis", sa.Text, nullable=False),
        sa.Column("correlation_id", sa.String(length=36), nullable=False, unique=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

def downgrade():
    op.drop_table("image_results")
