# backend/app/detectors/recruiter_scam.py

import re
from typing import List
from rapidfuzz import fuzz
import tldextract

from app.detectors.base import BaseDetector, DetectorResult
from app.utils.text_utils import (
    clean_text, find_spans, count_uppercase_ratio,
    count_exclamation_density, extract_emails, extract_urls,
)


# ── Urgency / pressure language patterns ─────────────────────────────────────
URGENCY_PATTERNS: List[tuple] = [
    (r"\brespond\b.{0,20}\bimmediately\b",          "Immediate response demand",        10),
    (r"\bdeadline\b.{0,20}\btoday\b",               "Same-day deadline pressure",       10),
    (r"\bonly\b.{0,10}\b(hours?|days?)\b.{0,10}\bleft\b", "Artificial time scarcity",   9),
    (r"\blast\s+chance\b",                           "Last-chance urgency",              9),
    (r"\bdon[''']t\s+miss\b",                        "Fear-of-missing-out trigger",      7),
    (r"\bact\s+now\b",                               "Act-now pressure",                 8),
    (r"\blimited\s+(time|slots?|openings?)\b",       "Artificial scarcity",              8),
    (r"\bconfirm\b.{0,20}\bwithin\b.{0,10}\d+\s*(hours?|mins?)\b",
                                                     "Timed confirmation demand",        9),
    (r"\bselected\b.{0,30}\bexclusively\b",          "False exclusivity claim",          7),
    (r"\bpre-?approved\b",                           "Pre-approval claim",               8),
]

# ── Linguistic impersonation markers ─────────────────────────────────────────
IMPERSONATION_PATTERNS: List[tuple] = [
    (r"\bhr\s+(manager|director|team)\b",            "Generic HR title (no name)",       6),
    (r"\brecruiting\s+on\s+behalf\s+of\b",           "Recruiting on behalf of (vague)",  8),
    (r"\bour\s+client\b.{0,30}\bconfidential\b",     "Confidential client claim",        9),
    (r"\bdirect(ly)?\s+hire\b",                      "Unverified direct-hire claim",     6),
    (r"\bno\s+agency\b",                             "Agency disclaimer (evasion tactic)",5),
    (r"\bwe\s+found\s+your\s+(resume|profile|cv)\b", "Unsolicited profile find claim",   7),
    (r"\byour\s+profile\s+(caught|matched|stood out)\b",
                                                     "Flattery-based cold contact",      6),
    (r"\bgovernment\s+(approved|certified|backed)\b","False government endorsement",    14),
    (r"\bverified\s+employer\b",                     "Unverifiable employer claim",      8),
]

# ── Domain spoofing — known brand TLD variants ────────────────────────────────
# Maps brand name to its real domain. Any other domain containing the brand
# substring is a spoofing attempt.
BRAND_DOMAINS = {
    "google":     "google.com",
    "linkedin":   "linkedin.com",
    "microsoft":  "microsoft.com",
    "amazon":     "amazon.com",
    "apple":      "apple.com",
    "meta":       "meta.com",
    "facebook":   "facebook.com",
    "netflix":    "netflix.com",
    "infosys":    "infosys.com",
    "wipro":      "wipro.com",
    "tcs":        "tcs.com",
    "accenture":  "accenture.com",
    "deloitte":   "deloitte.com",
}

# Suspicious free / anonymous email providers
FREE_EMAIL_PROVIDERS = [
    "gmail.com", "yahoo.com", "hotmail.com", "outlook.com",
    "aol.com", "protonmail.com", "mail.com", "yandex.com",
    "gmx.com", "tutanota.com",
]

# Linguistic fingerprints common in auto-generated scam recruiter messages
FILLER_PHRASES = [
    "kindly revert", "do the needful", "as per the attachment",
    "please revert back", "i came across your profile",
    "this is regarding an opening", "we have an urgent requirement",
    "greetings of the day", "hope this mail finds you well",
]


class RecruiterScamDetector(BaseDetector):
    """
    Detects recruiter impersonation and fraud via:
    1. Urgency / pressure language scoring
    2. Impersonation linguistic markers
    3. Domain spoofing heuristics (brand name in non-official domain)
    4. Free-email recruiter check
    5. Filler phrase fingerprinting (auto-generated message detection)
    6. Fuzzy sender name vs known brand matching
    """

    async def analyze(self, text: str, **kwargs) -> DetectorResult:
        text = clean_text(text)
        text_lower = text.lower()

        score = 0.0
        signals: list[str] = []
        spans: list[dict] = []

        # ── 1. Urgency / pressure language ───────────────────────────────────
        for pattern, label, weight in URGENCY_PATTERNS:
            if re.search(pattern, text_lower):
                score += weight
                signals.append(label)
                for m in re.finditer(pattern, text_lower):
                    sp = {
                        "start": m.start(), "end": m.end(),
                        "text": text[m.start():m.end()],
                        "reason": label,
                    }
                    spans.append(sp)

        # ── 2. Impersonation linguistic markers ───────────────────────────────
        for pattern, label, weight in IMPERSONATION_PATTERNS:
            if re.search(pattern, text_lower):
                score += weight
                signals.append(label)
                for m in re.finditer(pattern, text_lower):
                    spans.append({
                        "start": m.start(), "end": m.end(),
                        "text": text[m.start():m.end()],
                        "reason": label,
                    })

        # ── 3. Domain spoofing heuristics ─────────────────────────────────────
        urls = extract_urls(text)
        for url in urls:
            ext = tldextract.extract(url)
            full_domain = f"{ext.domain}.{ext.suffix}".lower()
            subdomain = ext.subdomain.lower()

            for brand, real_domain in BRAND_DOMAINS.items():
                # Brand appears in domain or subdomain but it's NOT the real domain
                brand_in_url = brand in full_domain or brand in subdomain
                is_real = full_domain == real_domain

                if brand_in_url and not is_real:
                    score += 18
                    label = f"Domain spoofing: '{full_domain}' impersonates '{real_domain}'"
                    signals.append(label)
                    spans.extend(find_spans(text, [url]))
                    break

            # Flag URLs with excessive subdomains (e.g. jobs.google.careers.apply.xyz.com)
            subdomain_depth = len(subdomain.split(".")) if subdomain else 0
            if subdomain_depth >= 3:
                score += 8
                signals.append(f"Suspicious subdomain depth in URL: {url[:60]}")
                spans.extend(find_spans(text, [url]))

        # ── 4. Free email provider used for recruitment ───────────────────────
        emails = extract_emails(text)
        for email in emails:
            domain = email.split("@")[-1].lower()
            if domain in FREE_EMAIL_PROVIDERS:
                score += 11
                signals.append(f"Free email provider used by recruiter: {email}")
                spans.extend(find_spans(text, [email]))

        # ── 5. Filler phrase fingerprinting ──────────────────────────────────
        filler_hits = []
        for phrase in FILLER_PHRASES:
            if phrase in text_lower:
                filler_hits.append(phrase)
                spans.extend(find_spans(text, [phrase]))

        if len(filler_hits) >= 2:
            score += 6 * len(filler_hits)
            signals.append(f"Auto-generated message fingerprint ({len(filler_hits)} filler phrases)")

        # ── 6. Fuzzy sender name vs brand ─────────────────────────────────────
        # Look for "From:" or "Sent by:" headers in pasted email text
        sender_match = re.search(r"from\s*:\s*([^\n<]+)", text_lower)
        if sender_match:
            sender_name = sender_match.group(1).strip()
            for brand in BRAND_DOMAINS:
                ratio = fuzz.partial_ratio(sender_name, brand)
                if 70 <= ratio < 100:
                    score += 12
                    signals.append(f"Sender name '{sender_name}' fuzzy-matches brand '{brand}'")
                    break

        # ── 7. Structural signals ─────────────────────────────────────────────
        if count_uppercase_ratio(text) > 0.25:
            score += 5
            signals.append("High uppercase ratio in recruiter message")

        if count_exclamation_density(text) > 0.8:
            score += 4
            signals.append("Excessive exclamation marks")

        # ── Normalize ─────────────────────────────────────────────────────────
        score = min(score, 100.0)
        confidence = min(len(signals) * 11.0, 95.0) if signals else 10.0

        return DetectorResult(
            score=round(score, 2),
            confidence=round(confidence, 2),
            signals=list(dict.fromkeys(signals)),
            spans=spans,
            metadata={
                "emails_found": emails,
                "urls_found": urls,
                "filler_phrases_hit": filler_hits,
            },
        )
