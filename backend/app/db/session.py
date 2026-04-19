# backend/app/db/session.py

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from app.config import settings

# Convert standard postgres:// URL to async-compatible postgresql+asyncpg://
DATABASE_URL = settings.DATABASE_URL.replace(
    "postgresql://", "postgresql+asyncpg://"
)

# Async engine — pool_pre_ping checks connections before use (handles DB restarts)
engine = create_async_engine(
    DATABASE_URL,
    echo=not settings.is_production,   # Log SQL in dev, silent in prod
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)

# Session factory — use as async context manager
SessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,            # Don't expire objects after commit
    autocommit=False,
    autoflush=False,
)
