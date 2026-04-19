# backend/app/models/scan_result.py

from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import String, Integer, Float, Text, DateTime, ForeignKey, JSON, func, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
import enum

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.flagged_entity import FlaggedEntity


class ScanType(str, enum.Enum):
    """Input type submitted for analysis."""
    JOB_POSTING   = "job_posting"
    MESSAGE       = "message"
    NEWS          = "news"
    URL           = "url"
    IMPERSONATION = "impersonation"


class RiskLevel(str, enum.Enum):
    """Aggregated risk level assigned by the explainability engine."""
    SAFE     = "safe"
    LOW      = "low"
    MEDIUM   = "medium"
    HIGH     = "high"
    CRITICAL = "critical"


class ScanResult(Base):
    __tablename__ = "scan_results"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    # ── Ownership ─────────────────────────────────────────────────────────────
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    # ── Input metadata ────────────────────────────────────────────────────────
    scan_type: Mapped[ScanType] = mapped_column(
        Enum(ScanType, values_callable=lambda obj: [e.value for e in obj]), nullable=False
    )
    # Raw text/URL submitted by the user (truncated to 10 000 chars for storage)
    input_text: Mapped[str] = mapped_column(Text, nullable=False)
    input_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)

    # ── Risk output ───────────────────────────────────────────────────────────
    risk_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    risk_level: Mapped[RiskLevel] = mapped_column(Enum(RiskLevel, values_callable=lambda obj: [e.value for e in obj]), nullable=False, default=RiskLevel.SAFE)

    # ── Full JSON report from explainability engine ───────────────────────────
    # Stores: signals_triggered, confidence, recommendation, highlighted_spans,
    #         attack_classification array
    report: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)

    # ── Timestamps ────────────────────────────────────────────────────────────
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False, index=True
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    user: Mapped["User"] = relationship("User", back_populates="scan_results")

    def __repr__(self) -> str:
        return f"<ScanResult id={self.id} type={self.scan_type} risk={self.risk_level}>"
