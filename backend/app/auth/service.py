# backend/app/auth/service.py

from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config import settings
from app.models.user import User
from app.models.audit_log import AuditLog, AuditAction
from app.auth.utils import hash_password, verify_password
from app.auth.schemas import UserRegister
from fastapi import HTTPException, status

# ── Token helpers ─────────────────────────────────────────────────────────────

def _create_token(data: dict, expires_delta: timedelta) -> str:
    """Sign a JWT with an expiry claim."""
    payload = data.copy()
    payload["exp"] = datetime.now(timezone.utc) + expires_delta
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_access_token(user_id: int) -> str:
    return _create_token(
        {"sub": str(user_id), "type": "access"},
        timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )


def create_refresh_token(user_id: int) -> str:
    return _create_token(
        {"sub": str(user_id), "type": "refresh"},
        timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )


def decode_access_token(token: str) -> Optional[dict]:
    """
    Decode and validate a JWT.
    Returns the payload dict on success, None on any failure.
    """
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        if payload.get("type") != "access":
            return None
        return payload
    except JWTError:
        return None


def decode_refresh_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            return None
        return payload
    except JWTError:
        return None


# ── DB-backed auth operations ─────────────────────────────────────────────────

async def register_user(db: AsyncSession, data: UserRegister) -> User:
    """Create a new user. Raises 409 if email or username is already taken."""
    # Check email uniqueness
    existing = await db.execute(select(User).where(User.email == data.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered.")

    # Check username uniqueness
    existing = await db.execute(select(User).where(User.username == data.username))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already taken.")

    user = User(
        email=data.email,
        username=data.username,
        hashed_password=hash_password(data.password),
    )
    db.add(user)
    await db.flush()  # Assign user.id before creating audit log

    db.add(AuditLog(
        user_id=user.id,
        action=AuditAction.REGISTER,
        description="Account created.",
    ))
    await db.commit()
    await db.refresh(user)
    return user


async def authenticate_user(db: AsyncSession, email: str, password: str) -> User:
    """Validate credentials. Raises 401 on any mismatch."""
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    # Constant-time failure — always call verify_password even if user is None
    # to prevent timing-based user enumeration
    dummy_hash = "$2b$12$KIXg6Kd5y5v5v5v5v5v5uu"
    hashed = user.hashed_password if user else dummy_hash

    if not verify_password(password, hashed) or user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is inactive.")

    # Update last login timestamp
    user.last_login_at = datetime.now(timezone.utc)
    db.add(AuditLog(user_id=user.id, action=AuditAction.LOGIN, description="User logged in."))
    await db.commit()
    await db.refresh(user)
    return user
