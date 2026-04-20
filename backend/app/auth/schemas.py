# backend/app/auth/schemas.py

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, field_validator
import re


class UserRegister(BaseModel):
    email: EmailStr
    username: str
    password: str
    full_name: Optional[str] = None

    @field_validator("username")
    @classmethod
    def username_alphanumeric(cls, v: str) -> str:
        if not re.match(r"^[a-zA-Z0-9_]{3,64}$", v):
            raise ValueError("Username must be 3–64 chars, alphanumeric or underscores only.")
        return v

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters.")
        return v

    @field_validator("full_name")
    @classmethod
    def clean_full_name(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip()
            if len(v) > 128:
                v = v[:128]
        return v or None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class UserOut(BaseModel):
    id: int
    email: str
    username: str
    full_name: Optional[str] = None
    phone: Optional[str] = None
    country: Optional[str] = None
    gender: Optional[str] = None
    is_active: bool
    is_superuser: bool
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
