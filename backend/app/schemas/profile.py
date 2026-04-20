# backend/app/schemas/profile.py
"""
Pydantic schemas for profile management endpoints.
Strict validation ensures data integrity at the API boundary.
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, field_validator
import re


class ProfileUpdate(BaseModel):
    """Payload for updating personal information."""
    full_name: Optional[str] = None
    phone: Optional[str] = None
    country: Optional[str] = None
    gender: Optional[str] = None

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip()
            if len(v) > 128:
                raise ValueError("Full name must be 128 characters or fewer.")
            if v and not re.match(r"^[a-zA-Z\s\-'.]{1,128}$", v):
                raise ValueError("Full name contains invalid characters.")
        return v or None

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip()
            if v and not re.match(r"^\+?[\d\s\-()]{6,20}$", v):
                raise ValueError("Invalid phone number format.")
        return v or None

    @field_validator("country")
    @classmethod
    def validate_country(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip()
            if len(v) > 64:
                raise ValueError("Country name must be 64 characters or fewer.")
        return v or None

    @field_validator("gender")
    @classmethod
    def validate_gender(cls, v: Optional[str]) -> Optional[str]:
        allowed = {"male", "female", "non-binary", "prefer not to say", "other", None, ""}
        if v is not None:
            v = v.strip().lower()
            if v and v not in allowed:
                raise ValueError("Gender must be one of: Male, Female, Non-binary, Prefer not to say, Other.")
        return v or None


class PasswordChange(BaseModel):
    """Payload for changing the account password."""
    current_password: str
    new_password: str
    confirm_password: str

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("New password must be at least 8 characters.")
        if not re.search(r"[A-Z]", v):
            raise ValueError("New password must contain at least one uppercase letter.")
        if not re.search(r"\d", v):
            raise ValueError("New password must contain at least one number.")
        return v

    @field_validator("confirm_password")
    @classmethod
    def validate_confirm(cls, v: str, info) -> str:
        new_pw = info.data.get("new_password")
        if new_pw and v != new_pw:
            raise ValueError("Passwords do not match.")
        return v


class AccountDelete(BaseModel):
    """Payload for account deletion — requires password confirmation."""
    password: str


class ScanTypeBreakdown(BaseModel):
    """Count of scans per scan type."""
    scan_type: str
    count: int


class ProfileStatsResponse(BaseModel):
    """Comprehensive profile statistics response."""
    total_scans: int = 0
    threats_detected: int = 0
    safe_count: int = 0
    scans_last_7d: int = 0
    threat_detection_rate: float = 0.0
    security_level: str = "Unknown"
    scan_type_breakdown: List[ScanTypeBreakdown] = []
    member_since: Optional[datetime] = None
    last_login: Optional[datetime] = None
