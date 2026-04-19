# backend/app/models/audit_log.py

from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import String, Integer, Text, DateTime, ForeignKey, JSON, func, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
import enum

if TYPE_CHECKING:
    from app.models.user import User


class AuditAction(str, enum.Enum):
    """Actions that are tracked in the audit trail."""
    REGISTER        = "register"
    LOGIN           = "login"
    LOGOUT          = "logout"
    TOKEN_REFRESH   = "token_refresh"
    SCAN_CREATED    = "scan_created"
    SCAN_DELETED    = "scan_deleted"
    PASSWORD_CHANGE = "password_change"
    ACCOUNT_DEACTIVATED = "account_deactivated"


class AuditLog(Base):
    """
    Immutable audit trail.
    One row per user action — never updated, only appended.
    """
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    # ── Who ───────────────────────────────────────────────────────────────────
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    # ── What ──────────────────────────────────────────────────────────────────
    action: Mapped[AuditAction] = mapped_column(Enum(AuditAction, values_callable=lambda obj: [e.value for e in obj]), nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Optional structured context (e.g. scan_id, IP, user-agent)
    context: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)

    # ── Where / how ───────────────────────────────────────────────────────────
    ip_address: Mapped[str | None] = mapped_column(String(64), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(String(512), nullable=True)

    # ── When ──────────────────────────────────────────────────────────────────
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False, index=True
    )

    # ── Relationship ──────────────────────────────────────────────────────────
    user: Mapped["User"] = relationship("User", back_populates="audit_logs")

    def __repr__(self) -> str:
        return f"<AuditLog id={self.id} user={self.user_id} action={self.action}>"
