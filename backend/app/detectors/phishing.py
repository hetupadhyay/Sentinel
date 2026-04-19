# backend/app/detectors/phishing.py

import re
from typing import List
import tldextract

from app.detectors.base import BaseDetector, DetectorResult
from app.utils.text_utils import (
    clean_text, find_spans, extract_emails, extract_urls,
)


# ── Social engineering tactic patterns ───────────────────────────────────────
# Cialdini's 6 principles: Authority, Scarcity, Urgency, Social Proof,
# Reciprocity, Liking — plus Fear and Credential Harvesting
TACTIC_PATTERNS: List[tuple] = [

    # Authority
    (r"\b(irs|fbi|interpol|police|court|legal\s+notice|government)\b",
     "Authority impersonation", "authority", 14),
    (r"\b(your\s+account\s+has\s+been\s+(suspended|locked|disabled|flagged))\b",
     "Account suspension threat", "authority", 13),
    (r"\bofficial\s+(notice|warning|alert)\b",
     "False official notice", "authority", 10),
    (r"\byour\s+(bank|paypal|amazon|netflix)\s+account\b.{0,30}\b(verify|confirm|update)\b",
     "Financial account verification request", "authority", 15),

    # Fear / Threat
    (r"\b(legal\s+action|lawsuit|arrest|prosecution)\b.{0,30}\b(if\s+you\s+(don[''']t|fail|ignore))\b",
     "Legal threat conditional on non-compliance", "fear", 16),
    (r"\byour\s+(data|files|account|device).{0,20}(will\s+be\s+)?(deleted|destroyed|exposed|leaked)\b",
     "Data destruction / exposure threat", "fear", 15),
    (r"\bwe\s+have\s+(recorded|captured|detected).{0,30}(your\s+(activity|screen|camera))\b",
     "Surveillance / sextortion claim", "fear", 18),
    (r"\bvirus\s+(detected|found|infected)\b",
     "Fake virus alert", "fear", 14),
    (r"\b(outstanding|unpaid)\s+(balance|invoice|dues|fine|penalty)\b",
     "Fake debt / penalty notice", "fear", 12),

    # Scarcity / Urgency
    (r"\b(expires?|expiring)\b.{0,15}\b(today|tonight|in\s+\d+\s*(hours?|mins?))\b",
     "Expiry urgency trigger", "scarcity", 10),
    (r"\bact\s+(now|immediately|within\s+\d+\s*(hours?|days?))\b",
     "Immediate action demand", "urgency", 10),
    (r"\b(last|final)\s+(warning|notice|chance|reminder)\b",
     "Final warning language", "urgency", 11),
    (r"\bdo\s+not\s+(ignore|delay|dismiss)\s+this\b",
     "Ignore-at-your-peril framing", "urgency", 9),

    # Credential harvesting
    (r"\b(enter|confirm|verify|update|re-?enter).{0,20}(password|pin|otp|credentials)\b",
     "Credential input request", "harvesting", 18),
    (r"\bclick\s+(here|the\s+link|below).{0,30}(verify|confirm|update|login)\b",
     "Phishing click-through instruction", "harvesting", 16),
    (r"\b(login|sign\s+in)\s+to\s+(verify|confirm|secure)\b",
     "Login-to-verify pattern", "harvesting", 15),
    (r"\byour\s+(one[- ]time\s+password|otp)\s+(is|was|has\s+been)\b",
     "OTP relay attempt", "harvesting", 17),

    # Reciprocity / prize lures
    (r"\b(won|winner|selected|chosen).{0,30}(prize|reward|gift|cash|voucher)\b",
     "Prize / reward lure", "reciprocity", 13),
    (r"\bclaim\s+(your\s+)?(reward|prize|gift|bonus)\b",
     "Reward claim trigger", "reciprocity", 12),
    (r"\bfree\s+(iphone|ipad|laptop|gift\s+card)\b",
     "Free high-value item lure", "reciprocity", 14),

    # Social proof
    (r"\b\d{1,3}(,\d{3})*\s+(users?|people|customers?)\s+(have\s+)?(already\s+)?(joined|verified|confirmed)\b",
     "False social proof (user count)", "social_proof", 8),
    (r"\bas\s+(seen|featured)\s+(on|in)\b.{0,30}(cnn|bbc|forbes|reuters)\b",
     "False media endorsement", "social_proof", 11),
]

# ── Suspicious URL heuristics ─────────────────────────────────────────────────
# TLDs commonly abused in phishing campaigns
SUSPICIOUS_TLDS = {
    "tk", "ml", "ga", "cf", "gq",       # Free Freenom TLDs
    "xyz", "top", "club", "online",     # Cheap bulk-registered TLDs
    "ru", "cn", "pw", "click", "link",
}

# URL shorteners — hide destination, common in phishing
URL_SHORTENERS = {
    "bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly",
    "buff.ly", "rb.gy", "cutt.ly", "short.io", "is.gd",
}

# Brands commonly spoofed in phishing URLs
SPOOFED_BRANDS = [
    "paypal", "amazon", "apple", "google", "microsoft", "netflix",
    "instagram", "facebook", "linkedin", "dropbox", "docusign",
    "bankofamerica", "wellsfargo", "chase", "citibank", "hdfc", "sbi",
]


class PhishingDetector(BaseDetector):
    """
    Detects phishing and social engineering attacks via:
    1. Tactic-tagged pattern matching (authority, fear, urgency, harvesting, etc.)
    2. Suspicious URL analysis (TLD, shortener, brand spoofing in path)
    3. Email sender anomaly detection
    4. Social engineering indicator (SEI) composite score
    """

    async def analyze(self, text: str, **kwargs) -> DetectorResult:
        text = clean_text(text)
        text_lower = text.lower()

        score = 0.0
        signals: list[str] = []
        spans: list[dict] = []

        # Track which SE tactics were triggered for metadata
        tactics_hit: dict[str, int] = {}

        # ── 1. Social engineering tactic scan ────────────────────────────────
        for pattern, label, tactic, weight in TACTIC_PATTERNS:
            if re.search(pattern, text_lower):
                score += weight
                signals.append(label)
                tactics_hit[tactic] = tactics_hit.get(tactic, 0) + 1

                for m in re.finditer(pattern, text_lower):
                    spans.append({
                        "start": m.start(),
                        "end": m.end(),
                        "text": text[m.start():m.end()],
                        "reason": f"[{tactic.upper()}] {label}",
                    })

        # Bonus: multiple distinct tactics = compound attack, higher confidence
        if len(tactics_hit) >= 3:
            score += 10
            signals.append(f"Multi-tactic attack: {', '.join(tactics_hit.keys())}")

        # ── 2. Suspicious URL analysis ────────────────────────────────────────
        urls = extract_urls(text)
        for url in urls:
            url_lower = url.lower()
            ext = tldextract.extract(url)
            tld = ext.suffix.lower()
            domain = f"{ext.domain}.{ext.suffix}".lower()

            # Suspicious TLD
            if tld in SUSPICIOUS_TLDS:
                score += 12
                signals.append(f"Suspicious TLD in URL: .{tld}")
                spans.extend(find_spans(text, [url]))

            # URL shortener — destination is hidden
            if domain in URL_SHORTENERS:
                score += 10
                signals.append(f"URL shortener detected: {domain}")
                spans.extend(find_spans(text, [url]))

            # Brand name in URL path (not domain) — credential harvesting page
            for brand in SPOOFED_BRANDS:
                if brand in url_lower and brand not in domain:
                    score += 14
                    signals.append(f"Brand '{brand}' in URL path (possible phishing page)")
                    spans.extend(find_spans(text, [url]))
                    break

            # IP address used as host instead of domain name
            if re.match(r"https?://\d{1,3}(\.\d{1,3}){3}", url):
                score += 16
                signals.append(f"IP address used as URL host: {url[:50]}")
                spans.extend(find_spans(text, [url]))

            # Excessive subdomains (obfuscation)
            subdomain_count = len(ext.subdomain.split(".")) if ext.subdomain else 0
            if subdomain_count >= 3:
                score += 8
                signals.append(f"Excessive subdomain nesting in URL: {url[:60]}")

            # Punycode / homograph attack detection
            if "xn--" in url_lower:
                score += 15
                signals.append(f"Punycode (homograph attack) detected in URL")
                spans.extend(find_spans(text, [url]))

        # ── 3. Email sender anomaly ───────────────────────────────────────────
        emails = extract_emails(text)
        for email in emails:
            domain = email.split("@")[-1].lower()
            ext = tldextract.extract(domain)
            tld = ext.suffix.lower()

            # Sender domain uses suspicious TLD
            if tld in SUSPICIOUS_TLDS:
                score += 10
                signals.append(f"Sender email on suspicious TLD domain: {email}")
                spans.extend(find_spans(text, [email]))

            # Brand name in sender domain but not the real brand domain
            for brand in SPOOFED_BRANDS:
                if brand in domain and not domain.startswith(brand + ".com"):
                    score += 13
                    signals.append(f"Sender email spoofs brand '{brand}': {email}")
                    spans.extend(find_spans(text, [email]))
                    break

        # ── 4. Raw link count anomaly ─────────────────────────────────────────
        # Legitimate messages rarely contain 5+ distinct URLs
        if len(urls) >= 5:
            score += 8
            signals.append(f"High link density: {len(urls)} URLs detected")

        # ── Normalize ─────────────────────────────────────────────────────────
        score = min(score, 100.0)

        # SEI = social engineering indicator composite
        sei_score = round(
            sum(tactics_hit.values()) / max(len(TACTIC_PATTERNS), 1) * 100, 2
        )
        confidence = min(len(signals) * 10.0, 95.0) if signals else 10.0

        return DetectorResult(
            score=round(score, 2),
            confidence=round(confidence, 2),
            signals=list(dict.fromkeys(signals)),
            spans=spans,
            metadata={
                "tactics_triggered": tactics_hit,
                "social_engineering_indicator": sei_score,
                "urls_analyzed": len(urls),
                "emails_analyzed": len(emails),
            },
        )
