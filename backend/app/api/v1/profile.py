# backend/app/api/v1/profile.py
"""
Profile management endpoints.

Provides full CRUD for user profile data including:
  - GET  /profile/stats    → Detailed profile statistics with computed security level
  - PUT  /profile          → Update personal information (full_name, phone, country, gender)
  - PUT  /profile/password → Change password with current-password verification
  - DELETE /profile        → Soft-delete (deactivate) account with password confirmation

All endpoints are rate-limited and require authentication.
"""

import logging
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Request, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.limiter import limiter
from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.scan_result import ScanResult, RiskLevel
from app.models.audit_log import AuditLog, AuditAction
from app.auth.utils import hash_password, verify_password
from app.schemas.profile import (
    ProfileUpdate,
    PasswordChange,
    AccountDelete,
    ProfileStatsResponse,
    ScanTypeBreakdown,
)

logger = logging.getLogger("sentinel.profile")
router = APIRouter()


def _compute_security_level(user: User, total_scans: int, threats: int) -> str:
    """
    Compute a user's security level based on account age, activity, and threat ratio.

    Scoring:
      - Account age > 30 days        → +20
      - Has performed scans           → +20
      - Scans > 10                    → +10
      - Threat detection rate < 30%   → +20
      - Has last_login_at             → +10
      - Has full_name filled          → +10
      - Has phone filled              → +10

    Levels: High (≥70), Medium (≥40), Low (<40)
    """
    score = 0

    if user.created_at:
        age_days = (datetime.now(timezone.utc) - user.created_at.replace(tzinfo=timezone.utc)).days
        if age_days > 30:
            score += 20

    if total_scans > 0:
        score += 20
    if total_scans > 10:
        score += 10

    if total_scans > 0:
        threat_rate = (threats / total_scans) * 100
        if threat_rate < 30:
            score += 20

    if user.last_login_at:
        score += 10
    if user.full_name:
        score += 10
    if user.phone:
        score += 10

    if score >= 70:
        return "High"
    elif score >= 40:
        return "Medium"
    return "Low"


# ── GET /profile/stats ────────────────────────────────────────────────────────

@router.get("/profile/stats", response_model=ProfileStatsResponse)
@limiter.limit("30/minute")
async def get_profile_stats(
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return comprehensive profile statistics for the authenticated user."""
    uid = current_user.id

    # Total scans
    total = (await db.execute(
        select(func.count()).where(ScanResult.user_id == uid)
    )).scalar() or 0

    # Threats (medium + high + critical)
    threats = (await db.execute(
        select(func.count()).where(
            ScanResult.user_id == uid,
            ScanResult.risk_level.in_([RiskLevel.MEDIUM, RiskLevel.HIGH, RiskLevel.CRITICAL]),
        )
    )).scalar() or 0

    # Safe scans
    safe = (await db.execute(
        select(func.count()).where(
            ScanResult.user_id == uid,
            ScanResult.risk_level == RiskLevel.SAFE,
        )
    )).scalar() or 0

    # Scans last 7 days
    cutoff = datetime.now(timezone.utc) - timedelta(days=7)
    scans_7d = (await db.execute(
        select(func.count()).where(
            ScanResult.user_id == uid,
            ScanResult.created_at >= cutoff,
        )
    )).scalar() or 0

    # Scan type breakdown
    type_rows = (await db.execute(
        select(ScanResult.scan_type, func.count().label("count"))
        .where(ScanResult.user_id == uid)
        .group_by(ScanResult.scan_type)
    )).all()
    breakdown = [
        ScanTypeBreakdown(scan_type=r.scan_type.value, count=r.count)
        for r in type_rows
    ]

    # Computed fields
    threat_rate = round((threats / total) * 100, 1) if total > 0 else 0.0
    security_level = _compute_security_level(current_user, total, threats)

    return ProfileStatsResponse(
        total_scans=total,
        threats_detected=threats,
        safe_count=safe,
        scans_last_7d=scans_7d,
        threat_detection_rate=threat_rate,
        security_level=security_level,
        scan_type_breakdown=breakdown,
        member_since=current_user.created_at,
        last_login=current_user.last_login_at,
    )


# ── PUT /profile ──────────────────────────────────────────────────────────────

@router.put("/profile")
@limiter.limit("10/minute")
async def update_profile(
    request: Request,
    data: ProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update the authenticated user's personal information."""
    updated_fields = []

    if data.full_name is not None:
        current_user.full_name = data.full_name
        updated_fields.append("full_name")

    if data.phone is not None:
        current_user.phone = data.phone
        updated_fields.append("phone")

    if data.country is not None:
        current_user.country = data.country
        updated_fields.append("country")

    if data.gender is not None:
        current_user.gender = data.gender
        updated_fields.append("gender")

    if not updated_fields:
        return {"detail": "No changes provided.", "updated": []}

    db.add(AuditLog(
        user_id=current_user.id,
        action=AuditAction.PASSWORD_CHANGE,  # Reusing closest action type
        description=f"Profile updated: {', '.join(updated_fields)}",
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    ))

    await db.commit()
    await db.refresh(current_user)

    logger.info(f"User {current_user.id} updated profile fields: {updated_fields}")

    return {
        "detail": "Profile updated successfully.",
        "updated": updated_fields,
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "username": current_user.username,
            "full_name": current_user.full_name,
            "phone": current_user.phone,
            "country": current_user.country,
            "gender": current_user.gender,
        },
    }


# ── PUT /profile/password ────────────────────────────────────────────────────

@router.put("/profile/password")
@limiter.limit("5/minute")
async def change_password(
    request: Request,
    data: PasswordChange,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Change the authenticated user's password.
    Requires the current password for verification (prevents session hijacking abuse).
    """
    # Verify current password
    if not verify_password(data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Current password is incorrect.",
        )

    # Prevent reuse of the same password
    if verify_password(data.new_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be different from the current password.",
        )

    current_user.hashed_password = hash_password(data.new_password)

    db.add(AuditLog(
        user_id=current_user.id,
        action=AuditAction.PASSWORD_CHANGE,
        description="Password changed successfully.",
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    ))

    await db.commit()
    logger.info(f"User {current_user.id} changed password.")

    return {"detail": "Password changed successfully."}


# ── DELETE /profile ───────────────────────────────────────────────────────────

@router.delete("/profile")
@limiter.limit("3/minute")
async def delete_account(
    request: Request,
    data: AccountDelete,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Soft-delete (deactivate) the authenticated user's account.
    Requires password confirmation. The account becomes inactive
    and the user can no longer log in.
    """
    # Verify password
    if not verify_password(data.password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Incorrect password. Account deletion cancelled.",
        )

    # Soft-delete: deactivate rather than hard-delete
    current_user.is_active = False

    db.add(AuditLog(
        user_id=current_user.id,
        action=AuditAction.ACCOUNT_DEACTIVATED,
        description="Account deactivated by user request.",
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    ))

    await db.commit()
    logger.info(f"User {current_user.id} deactivated their account.")

    return {"detail": "Account has been deactivated. You will be logged out."}
