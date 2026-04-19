# backend/alembic/versions/0001_initial_schema.py
"""Initial schema — users, scan_results, flagged_entities, audit_logs

Revision ID: 0001
Revises: 
Create Date: 2026-04-14
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── ENUM types ────────────────────────────────────────────────────────────
    # sa.Enum in create_table will automatically create these types.
    # We do not need to explicitly create them here.

    # ── users ─────────────────────────────────────────────────────────────────
    op.create_table(
        "users",
        sa.Column("id",               sa.Integer(),     primary_key=True, autoincrement=True),
        sa.Column("email",            sa.String(255),   nullable=False),
        sa.Column("username",         sa.String(64),    nullable=False),
        sa.Column("hashed_password",  sa.String(255),   nullable=False),
        sa.Column("is_active",        sa.Boolean(),     nullable=False, server_default="true"),
        sa.Column("is_superuser",     sa.Boolean(),     nullable=False, server_default="false"),
        sa.Column("created_at",       sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at",       sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("last_login_at",    sa.DateTime(timezone=True), nullable=True),
        sa.UniqueConstraint("email",    name="uq_users_email"),
        sa.UniqueConstraint("username", name="uq_users_username"),
    )
    op.create_index("ix_users_email",    "users", ["email"])
    op.create_index("ix_users_username", "users", ["username"])

    # ── scan_results ──────────────────────────────────────────────────────────
    op.create_table(
        "scan_results",
        sa.Column("id",          sa.Integer(),     primary_key=True, autoincrement=True),
        sa.Column("user_id",     sa.Integer(),     sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("scan_type",   sa.Enum("job_posting", "message", "news", "url", name="scantype"), nullable=False),
        sa.Column("input_text",  sa.Text(),        nullable=False),
        sa.Column("input_url",   sa.String(2048),  nullable=True),
        sa.Column("risk_score",  sa.Float(),       nullable=False, server_default="0.0"),
        sa.Column("risk_level",  sa.Enum("safe", "low", "medium", "high", "critical", name="risklevel"),
                  nullable=False, server_default="safe"),
        sa.Column("report",      postgresql.JSONB(), nullable=False, server_default="{}"),
        sa.Column("created_at",  sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_scan_results_user_id",   "scan_results", ["user_id"])
    op.create_index("ix_scan_results_created_at","scan_results", ["created_at"])

    # ── flagged_entities ──────────────────────────────────────────────────────
    op.create_table(
        "flagged_entities",
        sa.Column("id",           sa.Integer(),    primary_key=True, autoincrement=True),
        sa.Column("entity_type",  sa.Enum("domain", "email", "company", "phone",
                                          "keyword", "ip_address", name="entitytype"), nullable=False),
        sa.Column("value",        sa.String(1024), nullable=False),
        sa.Column("description",  sa.Text(),       nullable=True),
        sa.Column("confidence",   sa.Float(),      nullable=False, server_default="1.0"),
        sa.Column("metadata",     postgresql.JSONB(), nullable=False, server_default="{}"),
        sa.Column("hit_count",    sa.Integer(),    nullable=False, server_default="1"),
        sa.Column("created_at",   sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("last_seen_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("value", name="uq_flagged_entities_value"),
    )
    op.create_index("ix_flagged_entities_entity_type", "flagged_entities", ["entity_type"])
    op.create_index("ix_flagged_entities_value",       "flagged_entities", ["value"])

    # ── audit_logs ────────────────────────────────────────────────────────────
    op.create_table(
        "audit_logs",
        sa.Column("id",          sa.Integer(),    primary_key=True, autoincrement=True),
        sa.Column("user_id",     sa.Integer(),    sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("action",      sa.Enum("register", "login", "logout", "token_refresh",
                                         "scan_created", "scan_deleted",
                                         "password_change", "account_deactivated",
                                         name="auditaction"), nullable=False),
        sa.Column("description", sa.Text(),       nullable=True),
        sa.Column("context",     postgresql.JSONB(), nullable=False, server_default="{}"),
        sa.Column("ip_address",  sa.String(64),   nullable=True),
        sa.Column("user_agent",  sa.String(512),  nullable=True),
        sa.Column("created_at",  sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_audit_logs_user_id",   "audit_logs", ["user_id"])
    op.create_index("ix_audit_logs_action",    "audit_logs", ["action"])
    op.create_index("ix_audit_logs_created_at","audit_logs", ["created_at"])


def downgrade() -> None:
    op.drop_table("audit_logs")
    op.drop_table("flagged_entities")
    op.drop_table("scan_results")
    op.drop_table("users")

    op.execute("DROP TYPE IF EXISTS auditaction")
    op.execute("DROP TYPE IF EXISTS entitytype")
    op.execute("DROP TYPE IF EXISTS risklevel")
    op.execute("DROP TYPE IF EXISTS scantype")
