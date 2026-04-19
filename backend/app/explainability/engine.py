# backend/app/explainability/engine.py

from typing import Optional
import logging
from app.models.scan_result import ScanType, RiskLevel
from app.detectors.job_scam import JobScamDetector
from app.detectors.recruiter_scam import RecruiterScamDetector
from app.detectors.phishing import PhishingDetector
from app.detectors.ai_content import AIContentDetector
from app.detectors.news_credibility import NewsCredibilityDetector
from app.detectors.attack_classifier import AttackClassifier
from app.detectors.image_impersonation import ImageImpersonationDetector
from app.detectors.base import DetectorResult
from app.utils.verification_links import generate_verification_link

logger = logging.getLogger(__name__)

# ── Module weights per scan type ──────────────────────────────────────────────
# Defines which detectors run for each scan_type and their contribution weight
# to the final aggregate risk score (weights should sum to 1.0 per scan type).

MODULE_WEIGHTS: dict[str, dict[str, float]] = {
    ScanType.JOB_POSTING: {
        "job_scam":      0.55,
        "recruiter_scam":0.25,
        "phishing":      0.10,
        "ai_content":    0.10,
    },
    ScanType.MESSAGE: {
        "phishing":      0.60,
        "ai_content":    0.20,
        "recruiter_scam":0.20,
    },
    ScanType.NEWS: {
        "news_credibility": 0.70,
        "ai_content":       0.30,
    },
    ScanType.URL: {
        "phishing":      1.0,
    },
    ScanType.IMPERSONATION: {
        "image_impersonation": 1.0,
    },
}

# ── Risk level thresholds ─────────────────────────────────────────────────────
def _score_to_risk_level(score: float) -> RiskLevel:
    if score >= 75:
        return RiskLevel.CRITICAL
    if score >= 55:
        return RiskLevel.HIGH
    if score >= 35:
        return RiskLevel.MEDIUM
    if score >= 15:
        return RiskLevel.LOW
    return RiskLevel.SAFE


# ── Recommendation templates ──────────────────────────────────────────────────
RECOMMENDATIONS: dict[RiskLevel, str] = {
    RiskLevel.CRITICAL: (
        "This content exhibits multiple high-confidence indicators of a serious threat. "
        "Do not click any links, provide personal information, make any payments, or respond. "
        "Report this to your security team or platform administrator immediately. "
        "If credentials may have been exposed, change passwords and enable MFA now."
    ),
    RiskLevel.HIGH: (
        "Significant threat indicators were detected. Treat this content with strong suspicion. "
        "Verify the sender's identity through an independent channel before taking any action. "
        "Do not click links or download attachments. Contact the purported sender directly "
        "using contact information from their official website."
    ),
    RiskLevel.MEDIUM: (
        "Several suspicious patterns were found. Exercise caution before engaging with this content. "
        "Cross-reference any claims against official sources. Avoid providing personal or financial "
        "information until the legitimacy of the sender has been independently verified."
    ),
    RiskLevel.LOW: (
        "Minor risk signals detected. This content appears mostly legitimate but contains "
        "some patterns worth noting. Stay alert for follow-up requests for personal data or payments."
    ),
    RiskLevel.SAFE: (
        "No significant threat indicators were detected. This content appears safe. "
        "Always remain vigilant — no automated system provides 100% certainty."
    ),
}


# Global instance for detectors to avoid reloading models on every request
_GLOBAL_DETECTORS = None
_GLOBAL_CLASSIFIER = None

class ExplainabilityEngine:
    """
    Aggregates outputs from all detection modules into a unified, fully structured
    JSON report.
    """

    def __init__(self):
        global _GLOBAL_DETECTORS, _GLOBAL_CLASSIFIER
        
        if _GLOBAL_DETECTORS is None:
            _GLOBAL_DETECTORS = {}
        
        if _GLOBAL_CLASSIFIER is None:
            _GLOBAL_CLASSIFIER = AttackClassifier()
            
        self._detectors = _GLOBAL_DETECTORS
        self._classifier = _GLOBAL_CLASSIFIER

    def _get_detector(self, name: str):
        """Lazy-load detectors on demand."""
        if name not in self._detectors:
            logger.info(f"Lazy-loading detector: {name}...")
            if name == "job_scam":
                self._detectors[name] = JobScamDetector()
            elif name == "recruiter_scam":
                self._detectors[name] = RecruiterScamDetector()
            elif name == "phishing":
                self._detectors[name] = PhishingDetector()
            elif name == "ai_content":
                self._detectors[name] = AIContentDetector()
            elif name == "news_credibility":
                self._detectors[name] = NewsCredibilityDetector()
            elif name == "image_impersonation":
                self._detectors[name] = ImageImpersonationDetector()
        return self._detectors.get(name)

    async def run(
        self,
        text: str,
        scan_type: ScanType,
        url: Optional[str] = None,
        image1_base64: Optional[str] = None,
        image2_base64: Optional[str] = None,
    ) -> dict:
        import asyncio

        weights = MODULE_WEIGHTS.get(scan_type, MODULE_WEIGHTS[ScanType.MESSAGE])

        # ── 1. Run selected detectors concurrently ────────────────────────────
        tasks = {}
        for name in weights:
            det = self._get_detector(name)
            if det:
                tasks[name] = det.analyze(text, url=url, scan_type=scan_type, image1_base64=image1_base64, image2_base64=image2_base64)

        results: dict[str, DetectorResult] = {}
        if tasks:
            completed = await asyncio.gather(*tasks.values(), return_exceptions=True)
            for name, result in zip(tasks.keys(), completed):
                if isinstance(result, Exception):
                    # Detector failed — log and skip, don't crash the whole request
                    results[name] = DetectorResult(
                        score=0.0, confidence=0.0,
                        signals=[f"{name} detector error: {str(result)}"],
                    )
                else:
                    results[name] = result

        # ── 2. Run attack classifier on full text ─────────────────────────────
        classifier_result = await self._classifier.analyze(text, url=url)

        # ── 3. Weighted aggregate risk score ──────────────────────────────────
        weighted_score = 0.0
        module_scores: dict[str, float] = {}
        total_weight = sum(weights.get(name, 0) for name in results)

        for name, result in results.items():
            w = weights.get(name, 0)
            # Normalize weight if total_weight < 1 (some detectors errored out)
            effective_weight = w / total_weight if total_weight > 0 else w
            weighted_score += result.score * effective_weight
            module_scores[name] = round(result.score, 2)

        # Extract attack classifications from classifier metadata
        attack_classifications = classifier_result.metadata.get("attack_classifications", [])
        if not attack_classifications:
            attack_classifications = [{
                "attack_type": "Unknown / Other",
                "confidence": 0.0,
                "description": "No recognizable attack pattern matched the input.",
            }]

        # Add classifier contribution (if it detects a specific attack, increase risk)
        if any(a["confidence"] > 0.4 for a in attack_classifications if a.get("attack_type") != "Unknown / Other"):
            weighted_score = max(weighted_score, 15.0) # Base risk for identified attack
            weighted_score += 10.0 # Multiplier

        aggregate_score = min(round(weighted_score, 2), 100.0)

        # ── 4. Aggregate confidence (weighted average) ────────────────────────
        if results:
            total_conf = sum(
                r.confidence * weights.get(n, 0)
                for n, r in results.items()
            )
            aggregate_confidence = min(round(total_conf, 2), 95.0)
        else:
            aggregate_confidence = 0.0

        # ── 5. Merge signals (all detectors + classifier) ─────────────────────
        all_signals: list[str] = []
        for result in results.values():
            all_signals.extend(result.signals)
        all_signals.extend(classifier_result.signals)
        # Deduplicate preserving order
        seen = set()
        deduped_signals = []
        for s in all_signals:
            if s not in seen:
                seen.add(s)
                deduped_signals.append(s)

        # ── 6. Merge and sort spans by character position ─────────────────────
        all_spans: list[dict] = []
        for result in results.values():
            all_spans.extend(result.spans)
        all_spans.extend(classifier_result.spans)

        # Deduplicate spans by (start, end, reason) and sort by position
        seen_spans: set[tuple] = set()
        deduped_spans = []
        for sp in sorted(all_spans, key=lambda x: x.get("start", 0)):
            key = (sp.get("start"), sp.get("end"), sp.get("reason", ""))
            if key not in seen_spans:
                seen_spans.add(key)
                deduped_spans.append(sp)

        # ── 7. Risk level and recommendation ─────────────────────────────────
        risk_level = _score_to_risk_level(aggregate_score)
        recommendation = RECOMMENDATIONS[risk_level]

        # ── 8. Assemble final report ──────────────────────────────────────────
        report = {
            "risk_score":            aggregate_score,
            "risk_level":            risk_level.value,
            "confidence":            aggregate_confidence,
            "signals_triggered":     deduped_signals,
            "highlighted_spans":     deduped_spans,
            "recommendation":        recommendation,
            "attack_classification": attack_classifications,
            "module_scores":         module_scores,
        }

        # Inject verification link if it's a job posting and a company was detected
        if scan_type == ScanType.JOB_POSTING and "job_scam" in results:
            meta = results["job_scam"].metadata
            if meta.get("detected_company"):
                # Use a simplified title extraction or just the company name
                title_match = re.search(r"Job Title:\s*([^\n]+)", text) or re.search(r"([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})", text)
                title = title_match.group(1).strip() if title_match else ""
                report["official_verification_url"] = generate_verification_link(
                    meta["detected_company"], 
                    title
                )

        return report
