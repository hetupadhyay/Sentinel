# backend/app/models/flagged_entity.py

from datetime import datetime
from sqlalchemy import String, Integer, Float, Text, DateTime, JSON, func, Enum
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base
import enum


class EntityType(str, enum.Enum):
    """Category of flagged entity."""
    DOMAIN      = "domain"       # Suspicious domain / URL
    EMAIL       = "email"        # Suspicious sender address
    COMPANY     = "company"      # Spoofed / fake company name
    PHONE       = "phone"        # Suspicious phone number
    KEYWORD     = "keyword"      # High-signal scam/phishing keyword
    IP_ADDRESS  = "ip_address"   # Suspicious IP


class FlaggedEntity(Base):
    """
    Reusable threat-intelligence entries.
    Each record represents a single known-bad or suspicious entity
    that can be referenced across multiple scan results.
    """
    __tablename__ = "flagged_entities"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    # Entity data
    entity_type: Mapped[EntityType] = mapped_column(Enum(EntityType, values_callable=lambda obj: [e.value for e in obj]), nullable=False, index=True)
    value: Mapped[str] = mapped_column(String(1024), nullable=False, unique=True, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Confidence that this entity is malicious (0.0 – 1.0)
    confidence: Mapped[float] = mapped_column(Float, nullable=False, default=1.0)

    # Optional structured metadata (e.g. {"source": "manual", "tags": ["phishing"]})
    metadata_: Mapped[dict] = mapped_column("metadata", JSON, nullable=False, default=dict)

    # Hit count — incremented each time this entity appears in a scan
    hit_count: Mapped[int] = mapped_column(Integer, nullable=False, default=1)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    last_seen_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    def __repr__(self) -> str:
        return f"<FlaggedEntity type={self.entity_type} value={self.value}>"
