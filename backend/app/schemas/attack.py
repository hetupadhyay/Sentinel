# backend/app/schemas/attack.py

from pydantic import BaseModel


class AttackClassification(BaseModel):
    """
    Single attack type entry in the classification array.
    Every scan result will always contain at least one entry —
    falling back to 'Unknown / Other' if no pattern matches.
    """
    attack_type: str        # Human-readable label e.g. "Phishing", "SQL Injection"
    confidence: float       # 0.0 – 100.0 percentage
    description: str        # One-line plain-English reason for the flag
