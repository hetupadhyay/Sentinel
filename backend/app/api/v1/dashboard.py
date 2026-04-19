# backend/app/api/v1/dashboard.py
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text

from app.limiter import limiter
from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.scan_result import ScanResult, RiskLevel

router = APIRouter()


@router.get("/dashboard")
@limiter.limit("30/minute")
async def get_dashboard(
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    uid = current_user.id

    total = (await db.execute(
        select(func.count()).where(ScanResult.user_id == uid)
    )).scalar() or 0

    threats = (await db.execute(
        select(func.count()).where(
            ScanResult.user_id == uid,
            ScanResult.risk_level.in_([RiskLevel.MEDIUM, RiskLevel.HIGH, RiskLevel.CRITICAL]),
        )
    )).scalar() or 0

    safe = (await db.execute(
        select(func.count()).where(
            ScanResult.user_id == uid,
            ScanResult.risk_level == RiskLevel.SAFE,
        )
    )).scalar() or 0

    cutoff = datetime.now(timezone.utc) - timedelta(days=7)
    scans_7d = (await db.execute(
        select(func.count()).where(
            ScanResult.user_id == uid,
            ScanResult.created_at >= cutoff,
        )
    )).scalar() or 0

    dist_rows = (await db.execute(
        select(ScanResult.risk_level, func.count().label("count"))
        .where(ScanResult.user_id == uid)
        .group_by(ScanResult.risk_level)
    )).all()
    risk_distribution = [{"level": r.risk_level.value, "count": r.count} for r in dist_rows]

    attack_rows = (await db.execute(text("""
        SELECT elem->>'attack_type' AS attack_type, COUNT(*)::int AS count
        FROM scan_results,
             jsonb_array_elements(report->'attack_classification') AS elem
        WHERE user_id = :uid AND elem->>'attack_type' != 'Unknown / Other'
        GROUP BY attack_type ORDER BY count DESC LIMIT 8
    """), {"uid": uid})).all()
    top_attack_types = [{"attack_type": r.attack_type, "count": r.count} for r in attack_rows]

    recent_rows = (await db.execute(
        select(ScanResult)
        .where(ScanResult.user_id == uid)
        .order_by(ScanResult.created_at.desc())
        .limit(10)
    )).scalars().all()
    recent_scans = [
        {
            "id":         s.id,
            "scan_type":  s.scan_type.value,
            "input_text": s.input_text[:120],
            "risk_level": s.risk_level.value,
            "risk_score": s.risk_score,
            "created_at": s.created_at.isoformat(),
        }
        for s in recent_rows
    ]

    return {
        "total_scans":       total,
        "threats_detected":  threats,
        "safe_count":        safe,
        "scans_last_7d":     scans_7d,
        "risk_distribution": risk_distribution,
        "top_attack_types":  top_attack_types,
        "recent_scans":      recent_scans,
    }
