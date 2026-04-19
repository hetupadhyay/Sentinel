# backend/app/schemas/result.py

from pydantic import BaseModel
from typing import List, Optional
from app.schemas.attack import AttackClassification
from app.models.scan_result import RiskLevel


class HighlightedSpan(BaseModel):
    """A suspicious text fragment with its position and reason."""
    start: int              # Character offset start (relative to input_text)
    end: int                # Character offset end
    text: str               # The flagged fragment
    reason: Optional[str] = "Potential threat indicator detected."


class AnalyzeResponse(BaseModel):
    """
    Full explainability report returned by the /analyze endpoint
    and stored in scan_results.report (JSONB).
    """
    scan_id: int

    # ── Core risk assessment ───────────────────────────────────────────────
    risk_score: float                   # 0.0 – 100.0 aggregated score
    risk_level: RiskLevel               # safe | low | medium | high | critical
    confidence: float                   # 0.0 – 100.0 overall model confidence

    # ── Signals ───────────────────────────────────────────────────────────
    signals_triggered: List[str]        # Human-readable list of triggered signals
    highlighted_spans: List[HighlightedSpan]  # Suspicious fragments with positions

    # ── Actionable output ─────────────────────────────────────────────────
    recommendation: str                 # One-paragraph plain-English recommendation

    # ── Attack classification (always present, min 1 entry) ───────────────
    attack_classification: List[AttackClassification]

    # ── Per-module scores (optional transparency) ─────────────────────────
    module_scores: Optional[dict] = None  # e.g. {"job_scam": 72.0, "phishing": 15.0}
