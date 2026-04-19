# backend/app/auth/router.py
from fastapi import APIRouter, Depends, Request, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.limiter import limiter
from app.dependencies import get_db, get_current_user
from app.auth.schemas import UserRegister, UserLogin, TokenResponse, RefreshRequest, UserOut
from app.auth.service import (
    register_user, authenticate_user,
    create_access_token, create_refresh_token, decode_refresh_token,
)
from app.models.user import User

router = APIRouter()


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
async def register(request: Request, data: UserRegister, db: AsyncSession = Depends(get_db)):
    user = await register_user(db, data)
    return user


@router.post("/login", response_model=TokenResponse)
@limiter.limit("10/minute")
async def login(request: Request, data: UserLogin, db: AsyncSession = Depends(get_db)):
    user = await authenticate_user(db, data.email, data.password)
    return TokenResponse(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
    )


@router.post("/refresh", response_model=TokenResponse)
@limiter.limit("20/minute")
async def refresh_token(request: Request, data: RefreshRequest):
    payload = decode_refresh_token(data.refresh_token)
    if payload is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Invalid or expired refresh token.")
    user_id = int(payload["sub"])
    return TokenResponse(
        access_token=create_access_token(user_id),
        refresh_token=create_refresh_token(user_id),
    )


@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
