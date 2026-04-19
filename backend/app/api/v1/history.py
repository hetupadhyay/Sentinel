# backend/app/api/v1/history.py
import re
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_

from app.limiter import limiter
from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.scan_result import ScanResult, RiskLevel, ScanType

router = APIRouter()

_HTML_TAG_RE = re.compile(r"<[^>]+>")


@router.get("/history")
@limiter.limit("60/minute")
async def get_history(
    request: Request,
    page:       int           = Query(1,   ge=1),
    page_size:  int           = Query(15,  ge=1, le=100),
    risk_level: Optional[str] = Query(None),
    scan_type:  Optional[str] = Query(None),
    date_from:  Optional[str] = Query(None),
    date_to:    Optional[str] = Query(None),
    query:      Optional[str] = Query(None),
    db:         AsyncSession  = Depends(get_db),
    current_user: User        = Depends(get_current_user),
):
    uid = current_user.id
    conditions = [ScanResult.user_id == uid]

    if risk_level:
        try:
            conditions.append(ScanResult.risk_level == RiskLevel(risk_level))
        except ValueError:
            pass

    if scan_type:
        try:
            conditions.append(ScanResult.scan_type == ScanType(scan_type))
        except ValueError:
            pass

    if date_from:
        try:
            dt = datetime.fromisoformat(date_from).replace(tzinfo=timezone.utc)
            conditions.append(ScanResult.created_at >= dt)
        except ValueError:
            pass

    if date_to:
        try:
            dt = datetime.fromisoformat(date_to).replace(tzinfo=timezone.utc) + timedelta(days=1)
            conditions.append(ScanResult.created_at < dt)
        except ValueError:
            pass

    if query:
        conditions.append(ScanResult.input_text.ilike(f"%{query}%"))

    where = and_(*conditions)

    total = (await db.execute(select(func.count()).where(where))).scalar() or 0
    offset = (page - 1) * page_size

    rows = (await db.execute(
        select(ScanResult).where(where)
        .order_by(ScanResult.created_at.desc())
        .offset(offset).limit(page_size)
    )).scalars().all()

    return {
        "items": [
            {
                "id":         s.id,
                "scan_type":  s.scan_type.value,
                "input_text": s.input_text[:150],
                "input_url":  s.input_url,
                "risk_level": s.risk_level.value,
                "risk_score": s.risk_score,
                "report":     s.report,
                "created_at": s.created_at.isoformat(),
            }
            for s in rows
        ],
        "total":       total,
        "page":        page,
        "page_size":   page_size,
        "total_pages": max(1, -(-total // page_size)),
    }


@router.get("/history/{scan_id}")
@limiter.limit("60/minute")
async def get_scan(
    request: Request,
    scan_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    row = (await db.execute(
        select(ScanResult).where(
            ScanResult.id == scan_id,
            ScanResult.user_id == current_user.id,
        )
    )).scalar_one_or_none()

    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan not found.")

    return {
        "id":         row.id,
        "scan_type":  row.scan_type.value,
        "input_text": row.input_text,
        "input_url":  row.input_url,
        "risk_level": row.risk_level.value,
        "risk_score": row.risk_score,
        "report":     row.report,
        "created_at": row.created_at.isoformat(),
    }
