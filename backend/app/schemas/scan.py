# backend/app/schemas/scan.py

from pydantic import BaseModel, field_validator, model_validator
from typing import Optional
from app.models.scan_result import ScanType


class AnalyzeRequest(BaseModel):
    """
    Unified input payload for the /analyze endpoint.
    At least one of text or url must be provided.
    scan_type tells the router which detection module to prioritize.
    """
    scan_type: ScanType
    text: Optional[str] = None
    url: Optional[str] = None
    image1_base64: Optional[str] = None
    image2_base64: Optional[str] = None

    @model_validator(mode="after")
    def require_content(self) -> "AnalyzeRequest":
        if not self.text and not self.url and not self.image1_base64:
            raise ValueError("Provide at least one of 'text', 'url', or 'image1_base64'.")
        return self

    @field_validator("text")
    @classmethod
    def truncate_text(cls, v: Optional[str]) -> Optional[str]:
        # Hard cap at 10 000 chars to prevent abuse and keep inference times sane
        if v and len(v) > 10_000:
            return v[:10_000]
        return v
