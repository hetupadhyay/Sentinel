# backend/alembic/env.py

import asyncio
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

# ── Load app config and models ────────────────────────────────────────────────
# sys.path is prepended with '.' in alembic.ini so app imports resolve
from app.config import settings
from app.db.base import Base  # noqa: F401 — imports all models as side-effect

# ── Alembic Config object ─────────────────────────────────────────────────────
config = context.config

# Wire Python logging from alembic.ini
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Point Alembic at the full metadata so autogenerate can diff the schema
target_metadata = Base.metadata

# Override the DB URL from app settings (ignores the placeholder in alembic.ini)
# asyncpg driver required for async engine
DB_URL = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
config.set_main_option("sqlalchemy.url", DB_URL)


# ── Offline migrations (no live DB connection) ────────────────────────────────
def run_migrations_offline() -> None:
    """
    Emit migration SQL to stdout without connecting to the DB.
    Useful for generating SQL scripts to review or apply manually.
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        # Render column-level comments in generated SQL
        render_as_batch=True,
    )
    with context.begin_transaction():
        context.run_migrations()


# ── Online migrations (live async DB connection) ──────────────────────────────
def do_run_migrations(connection: Connection) -> None:
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        # batch mode required for SQLite; harmless on Postgres
        render_as_batch=True,
        # Include schema-level objects (enums, etc.) in autogenerate diff
        include_schemas=True,
    )
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """Create an async engine and run migrations within a connection context."""
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,   # No connection pooling during migrations
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()


def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())


# ── Entry point ───────────────────────────────────────────────────────────────
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
