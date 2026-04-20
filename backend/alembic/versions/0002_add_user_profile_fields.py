# backend/alembic/versions/0002_add_user_profile_fields.py
"""Add profile fields to users table (full_name, phone, country, gender)

Revision ID: 0002
Revises: 0001
Create Date: 2026-04-20
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── Add profile columns to users table ────────────────────────────────────
    op.add_column("users", sa.Column("full_name", sa.String(128), nullable=True))
    op.add_column("users", sa.Column("phone",     sa.String(20),  nullable=True))
    op.add_column("users", sa.Column("country",   sa.String(64),  nullable=True))
    op.add_column("users", sa.Column("gender",    sa.String(16),  nullable=True))

    # ── Add 'impersonation' to scantype enum if missing ───────────────────────
    # PostgreSQL enums need explicit ALTER TYPE for new values
    op.execute("ALTER TYPE scantype ADD VALUE IF NOT EXISTS 'impersonation'")


def downgrade() -> None:
    op.drop_column("users", "gender")
    op.drop_column("users", "country")
    op.drop_column("users", "phone")
    op.drop_column("users", "full_name")
    # Note: PostgreSQL doesn't support removing enum values easily,
    # so we leave 'impersonation' in the scantype enum on downgrade.
