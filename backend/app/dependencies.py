# backend/app/dependencies.py

from typing import AsyncGenerator
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import SessionLocal
from app.auth.service import decode_access_token
from app.models.user import User
from sqlalchemy import select

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


# ── Database session dependency ───────────────────────────────────────────────
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Yields an async SQLAlchemy session, closes it after request completes."""
    async with SessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


# ── Current user dependency ───────────────────────────────────────────────────
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Decodes JWT, loads matching User from DB.
    Raises 401 if token is invalid or user doesn't exist.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    result = await db.execute(select(User).where(User.id == int(user_id)))
    user = result.scalar_one_or_none()

    if user is None:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive.",
        )

    return user
