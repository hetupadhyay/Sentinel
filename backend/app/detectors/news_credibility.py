# backend/app/detectors/news_credibility.py

import re
from typing import List
import tldextract

from app.detectors.base import BaseDetector, DetectorResult
from app.utils.text_utils import (
    clean_text, find_spans, sentence_tokenize,
    count_uppercase_ratio, count_exclamation_density, extract_urls,
)


# ── Known credible news source domains ───────────────────────────────────────
CREDIBLE_DOMAINS = {
    # International wire services
    "reuters.com", "apnews.com", "afp.com",
    # Major newspapers
    "nytimes.com", "theguardian.com", "washingtonpost.com",
    "wsj.com", "ft.com", "economist.com", "bbc.com", "bbc.co.uk",
    # Indian credible outlets
    "thehindu.com", "hindustantimes.com", "ndtv.com",
    "timesofindia.indiatimes.com", "indianexpress.com",
    # Broadcast / digital
    "cnn.com", "nbcnews.com", "cbsnews.com", "abcnews.go.com",
    "npr.org", "pbs.org", "aljazeera.com",
    # Science / fact-check
    "snopes.com", "factcheck.org", "politifact.com",
    "nature.com", "science.org", "who.int", "cdc.gov",
}

# ── Known disreputable / satire / clickbait domains ──────────────────────────
DISREPUTABLE_DOMAINS = {
    "infowars.com", "naturalnews.com", "beforeitsnews.com",
    "worldnewsdailyreport.com", "empirenews.net", "thelastlineofdefense.org",
    "abcnews.com.co", "theonion.com",           # Satire — not necessarily malicious
    "clickhole.com", "babylonbee.com",
    "yournewswire.com", "newspunch.com", "neonnettle.com",
    "gellerreport.com", "thegatewayp.com",
}

# ── Sensationalist language patterns ─────────────────────────────────────────
SENSATIONALISM_PATTERNS: List[tuple] = [
    (r"\b(SHOCKING|BOMBSHELL|EXPLOSIVE|BREAKING)\b",
     "All-caps sensationalist headline word", 10),
    (r"\b(you won[''']t believe|this will shock you|mind[-\s]?blowing)\b",
     "Clickbait engagement hook", 10),
    (r"\b(they don[''']t want you to know|the truth (they|media) (hides?|suppresses?))\b",
     "Conspiracy framing ('they' suppression)", 14),
    (r"\b(mainstream media|fake news|deep state|plandemic|scamdemic)\b",
     "Disinformation dog-whistle terminology", 12),
    (r"\b(miracle|cure|100%\s+effective|guaranteed\s+to)\b",
     "Miracle-cure / absolute-certainty claim", 11),
    (r"\b(wake up|sheeple|red pill|open your eyes)\b",
     "Radicalization / conspiracy recruitment language", 13),
    (r"\b(illuminati|new world order|george soros|bill gates).{0,30}(control|plan|agenda)\b",
     "Conspiracy theory named actor attribution", 14),
    (r"\b(doctors hate|scientists fear|governments hide)\b",
     "Adversarial framing against institutions", 11),
    (r"\bshare\s+(before|this)\s+(it[''']s\s+)?(deleted|removed|banned|censored)\b",
     "Pre-censorship urgency share bait", 12),
    (r"\bEXCLUSIVE\b.{0,30}\b(leaked?|exposed?|revealed?)\b",
     "Exclusive leak / exposure claim", 10),
]

# ── Fabrication indicator patterns ───────────────────────────────────────────
FABRICATION_PATTERNS: List[tuple] = [
    (r"\b(anonymous\s+source|insider\s+(told|says|claims)|source\s+close\s+to)\b",
     "Unverifiable anonymous sourcing", 9),
    (r"\b(according\s+to\s+(some|many|several)\s+(people|experts|sources))\b",
     "Vague attribution (no named source)", 8),
    (r"\bsome\s+are\s+saying\b",
     "Rumor laundering ('some are saying')", 10),
    (r"\b(allegedly|reportedly|unconfirmed(ly)?)\b",
     "Hedging language suggesting unverified claim", 6),
    (r"\b(photo[- ]?shopped|digitally\s+altered|manipulated\s+(image|video|footage))\b",
     "Media manipulation acknowledgment", 8),
    (r"\b(satire|fictional|parody)\b",
     "Satirical / fictional content marker", 7),
]

# ── Emotional manipulation language ──────────────────────────────────────────
EMOTIONAL_PATTERNS: List[tuple] = [
    (r"\b(outraged?|furious|disgusting|horrifying|appalling)\b",
     "Strong emotional provocation language", 7),
    (r"\b(patriots?|freedom\s+fighters?|true\s+americans?)\b",
     "In-group identity trigger", 6),
    (r"\b(traitors?|evil|corrupt|criminal(s|ity)?)\b.{0,20}\b(politicians?|government|media)\b",
     "Dehumanizing institutional framing", 9),
]

# Minimum word count for a meaningful credibility analysis
MIN_WORD_COUNT = 30


class NewsCredibilityDetector(BaseDetector):
    """
    Assesses news credibility via:
    1. Source domain reputation check (credible vs disreputable list)
    2. Sensationalist language pattern scoring
    3. Fabrication indicator detection (vague sourcing, hedging)
    4. Emotional manipulation language detection
    5. Structural quality signals (headline caps, punctuation density)
    6. Cross-reference URL triangulation
    Returns a credibility score (0 = not credible, 100 = highly credible)
    Note: risk_score is INVERTED — high credibility = low risk.
    """

    async def analyze(self, text: str, **kwargs) -> DetectorResult:
        text = clean_text(text)
        text_lower = text.lower()
        sentences = sentence_tokenize(text)
        words = text.split()

        # Raw penalty accumulator — converted to risk score at the end
        penalty = 0.0
        signals: list[str] = []
        spans: list[dict] = []
        credibility_boosts = 0

        if len(words) < MIN_WORD_COUNT:
            return DetectorResult(
                score=30.0,
                confidence=15.0,
                signals=["Text too short for reliable credibility assessment"],
                spans=[],
                metadata={"credibility_score": 70.0},
            )

        # ── 1. Source domain reputation ───────────────────────────────────────
        urls = extract_urls(text)
        for url in urls:
            ext = tldextract.extract(url)
            domain = f"{ext.domain}.{ext.suffix}".lower()
            full = f"{ext.subdomain}.{domain}".lstrip(".").lower()

            if domain in CREDIBLE_DOMAINS or full in CREDIBLE_DOMAINS:
                credibility_boosts += 1
                signals.append(f"Credible source referenced: {domain}")

            if domain in DISREPUTABLE_DOMAINS or full in DISREPUTABLE_DOMAINS:
                penalty += 25
                signals.append(f"Disreputable / satirical domain referenced: {domain}")
                spans.extend(find_spans(text, [url]))

        # ── 2. Sensationalist language ────────────────────────────────────────
        for pattern, label, weight in SENSATIONALISM_PATTERNS:
            if re.search(pattern, text, re.IGNORECASE):
                penalty += weight
                signals.append(label)
                for m in re.finditer(pattern, text, re.IGNORECASE):
                    spans.append({
                        "start": m.start(), "end": m.end(),
                        "text": text[m.start():m.end()],
                        "reason": label,
                    })

        # ── 3. Fabrication indicators ─────────────────────────────────────────
        for pattern, label, weight in FABRICATION_PATTERNS:
            if re.search(pattern, text_lower):
                penalty += weight
                signals.append(label)
                for m in re.finditer(pattern, text_lower):
                    spans.append({
                        "start": m.start(), "end": m.end(),
                        "text": text[m.start():m.end()],
                        "reason": label,
                    })

        # ── 4. Emotional manipulation ─────────────────────────────────────────
        for pattern, label, weight in EMOTIONAL_PATTERNS:
            if re.search(pattern, text_lower):
                penalty += weight
                signals.append(label)
                for m in re.finditer(pattern, text_lower):
                    spans.append({
                        "start": m.start(), "end": m.end(),
                        "text": text[m.start():m.end()],
                        "reason": label,
                    })

        # ── 5. Structural quality signals ─────────────────────────────────────
        # High uppercase ratio (shouting / clickbait headline)
        upper_ratio = count_uppercase_ratio(text)
        if upper_ratio > 0.35:
            penalty += 10
            signals.append(f"Excessive capitalization ({upper_ratio:.0%}) — clickbait indicator")

        # Exclamation mark density
        excl_density = count_exclamation_density(text)
        if excl_density > 1.5:
            penalty += 8
            signals.append(f"High exclamation mark density ({excl_density:.2f}/100 chars)")

        # No URLs at all — unverifiable claims
        if not urls:
            penalty += 6
            signals.append("No source URLs present — claims unverifiable")

        # Very short sentences on average — headline stacking (tabloid signal)
        avg_sent_len = sum(len(s.split()) for s in sentences) / max(len(sentences), 1)
        if avg_sent_len < 8:
            penalty += 7
            signals.append(f"Very short average sentence length ({avg_sent_len:.1f} words) — tabloid structure")

        # ── 6. Credibility boost reduction ───────────────────────────────────
        # Each credible source reference reduces penalty
        penalty = max(0.0, penalty - (credibility_boosts * 8))

        # ── Compute credibility score and risk score ──────────────────────────
        risk_score = min(penalty, 100.0)
        credibility_score = round(100.0 - risk_score, 2)

        if credibility_score >= 70:
            signals.append(f"Overall credibility assessment: HIGH ({credibility_score:.0f}/100)")
        elif credibility_score >= 40:
            signals.append(f"Overall credibility assessment: MODERATE ({credibility_score:.0f}/100)")
        else:
            signals.append(f"Overall credibility assessment: LOW ({credibility_score:.0f}/100)")

        confidence = min(len(signals) * 9.0 + 15.0, 92.0)

        return DetectorResult(
            score=round(risk_score, 2),
            confidence=round(confidence, 2),
            signals=list(dict.fromkeys(signals)),
            spans=spans,
            metadata={
                "credibility_score": credibility_score,
                "sources_found": len(urls),
                "credible_sources": credibility_boosts,
                "avg_sentence_length": round(avg_sent_len, 2),
            },
        )
