# backend/app/detectors/base.py

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import List


@dataclass
class DetectorResult:
    """
    Standardized output from every detection module.
    All detectors must return this structure so the explainability
    engine can aggregate them uniformly.
    """
    score: float                        # 0.0 – 100.0 risk contribution from this module
    confidence: float                   # 0.0 – 100.0 confidence in the score
    signals: List[str] = field(default_factory=list)   # Human-readable triggered signals
    spans: List[dict] = field(default_factory=list)    # Highlighted text spans: {start, end, text, reason}
    metadata: dict = field(default_factory=dict)       # Any extra module-specific data


class BaseDetector(ABC):
    """
    Abstract base class for all Sentinel detection modules.
    Every detector must implement the async analyze() method.
    """

    @abstractmethod
    async def analyze(self, text: str, **kwargs) -> DetectorResult:
        """
        Run detection logic against the input text.

        Args:
            text:    The cleaned input string to analyze.
            **kwargs: Optional context — e.g. url=, scan_type=

        Returns:
            DetectorResult with score, confidence, signals, and spans.
        """
        ...
