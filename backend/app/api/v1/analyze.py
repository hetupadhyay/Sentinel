# backend/app/api/v1/analyze.py
import re
from fastapi import APIRouter, Depends, Request, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.limiter import limiter
from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.scan_result import ScanResult, RiskLevel
from app.models.audit_log import AuditLog, AuditAction
from app.schemas.scan import AnalyzeRequest
from app.schemas.result import AnalyzeResponse
from app.explainability.engine import ExplainabilityEngine

router = APIRouter()

_HTML_TAG_RE = re.compile(r"<[^>]+>")
_NULL_BYTE_RE = re.compile(r"\x00")


def sanitize(text: str) -> str:
    if not text:
        return text
    text = _NULL_BYTE_RE.sub("", text)
    text = _HTML_TAG_RE.sub("", text)
    return text.strip()[:10_000]


@router.post("/analyze", response_model=AnalyzeResponse, status_code=status.HTTP_200_OK)
@limiter.limit("6/minute")
async def analyze_endpoint(
    request: Request,
    payload: AnalyzeRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    raw = payload.text or payload.url or (payload.image1_base64 and "IMAGE_UPLOAD")
    if not raw:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                            detail="No analyzable content provided.")

    input_text = sanitize(payload.text) if payload.text else (payload.url if payload.url else "Image Analysis")

    engine = ExplainabilityEngine()
    report = await engine.run(
        text=input_text,
        scan_type=payload.scan_type,
        url=payload.url,
        image1_base64=payload.image1_base64,
        image2_base64=payload.image2_base64,
    )

    scan = ScanResult(
        user_id=current_user.id,
        scan_type=payload.scan_type,
        input_text=input_text,
        input_url=payload.url,
        risk_score=report["risk_score"],
        risk_level=RiskLevel(report["risk_level"]),
        report=report,
    )
    db.add(scan)
    await db.flush()

    db.add(AuditLog(
        user_id=current_user.id,
        action=AuditAction.SCAN_CREATED,
        description=f"Scan #{scan.id} type={payload.scan_type} risk={scan.risk_level}",
        context={
            "scan_id": scan.id,
            "scan_type": str(payload.scan_type),
            "risk_level": str(scan.risk_level),
            "risk_score": scan.risk_score,
        },
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    ))

    await db.commit()
    await db.refresh(scan)

    return AnalyzeResponse(
        scan_id=scan.id,
        risk_score=report["risk_score"],
        risk_level=report["risk_level"],
        confidence=report["confidence"],
        signals_triggered=report["signals_triggered"],
        highlighted_spans=report["highlighted_spans"],
        recommendation=report["recommendation"],
        attack_classification=report["attack_classification"],
        module_scores=report.get("module_scores"),
    )
