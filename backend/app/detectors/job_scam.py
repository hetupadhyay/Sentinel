# backend/app/detectors/job_scam.py

import re
from typing import List, Optional
from rapidfuzz import fuzz

from app.detectors.base import BaseDetector, DetectorResult
from app.utils.text_utils import (
    clean_text, find_spans, count_uppercase_ratio,
    count_exclamation_density, extract_emails, word_count,
)


# ── Red-flag keyword patterns ─────────────────────────────────────────────────
# Each entry: (pattern_string, signal_label, score_weight)
RED_FLAG_PATTERNS: List[tuple] = [
    # Upfront payment / fee scams
    (r"\bpay\b.{0,30}\bfee\b",              "Upfront fee request",              15),
    (r"\bregistration fee\b",               "Registration fee request",         15),
    (r"\bsecurity deposit\b",               "Security deposit demand",          12),
    (r"\bwire transfer\b",                  "Wire transfer instruction",        14),
    (r"\bwestern union\b",                  "Western Union payment",            18),
    (r"\bmoneygram\b",                      "MoneyGram payment",                18),
    (r"\bcryptocurrency\b|\bcrypto\b",      "Cryptocurrency payment request",   14),

    # Unrealistic compensation
    (r"\bearn\b.{0,20}\$\d{3,}",           "Unrealistic earnings claim",       10),
    (r"\$\d{3,}\s*per\s*(hour|day|week)",  "Implausible hourly/daily rate",    12),
    (r"\bwork from home\b.{0,40}\bno experience\b",
                                            "No-experience WFH claim",          10),

    # Urgency / pressure
    (r"\burgent(ly)?\b",                   "Urgency pressure language",         6),
    (r"\bimmediate(ly)?\b.{0,20}\bhire\b", "Immediate hire pressure",           8),
    (r"\blimited\s+position",              "Artificial scarcity",               7),
    (r"\bapply\s+now\b",                   "High-pressure CTA",                 5),

    # Vague / fake company signals
    (r"\bconfidential\s+company\b",        "Undisclosed employer",              9),
    (r"\bno\s+interview\b",                "No interview required",            12),
    (r"\bwork\s+from\s+anywhere\b",        "Unverifiable remote claim",         6),

    # Personal data harvesting
    (r"\bpassport\s+(number|copy)\b",      "Passport data request",            16),
    (r"\bsocial\s+security\b",             "SSN request",                      18),
    (r"\bbank\s+account\s+(number|details)\b",
                                           "Bank account data request",        18),

    # Whatsapp / personal channel recruitment
    (r"\bwhatsapp\b.{0,30}\bjob\b",       "WhatsApp job recruitment",          10),
    (r"\btelegram\b.{0,30}\bjob\b",       "Telegram job recruitment",          10),
]

# ── Known legitimate company names for fuzzy anti-spoofing ───────────────────
KNOWN_COMPANIES = [
    "Google", "Meta", "Amazon", "Microsoft", "Apple", "Netflix",
    "Tesla", "Nvidia", "IBM", "Oracle", "Salesforce", "Adobe",
    "Infosys", "Wipro", "TCS", "Accenture", "Deloitte", "McKinsey",
    "Goldman Sachs", "JPMorgan", "Citibank", "HDFC", "ICICI",
    "Reliance", "Tata", "Mahindra", "Flipkart", "Zomato", "Paytm",
    "Snapchat", "Discord", "OpenAI", "Anthropic", "Adobe",
]

# Companies that frequently pay high salaries (suppress unrealistic salary flags)
PREMIUM_COMPANIES = [
    "Google", "Meta", "Amazon", "Microsoft", "Apple", "Netflix", "Nvidia", 
    "OpenAI", "Anthropic", "Goldman Sachs", "Jane Street", "Citadel",
]

# Fuzzy match threshold — names scoring above this are considered spoofing attempts
SPOOF_THRESHOLD = 75

# Salary anomaly thresholds (normalized to USD monthly)
MAX_REALISTIC_MONTHLY_SALARY = 60_000  # $720k / year
PROFESSIONAL_SALARY_THRESHOLD = 8_000 # $100k / year

# Approximate conversion rates to USD for normalization
CURRENCY_RATES = {
    "$": 1.0,
    "₹": 0.012,
    "£": 1.27,
    "€": 1.08,
    "c$": 0.74,
    "cad": 0.74,
    "a$": 0.65,
    "rs": 0.012,
    "inr": 0.012,
}

class JobScamDetector(BaseDetector):
    """
    Detects fraudulent job postings using:
    1. Red-flag keyword/pattern matching with weighted scoring
    2. Multi-currency salary normalization and plausibility checks
    3. Company name fuzzy-matching against known legitimate companies
    4. Premium company discount (reduces false positives for high-pay roles)
    """

    def _extract_company(self, text: str) -> Optional[str]:
        # Simple extraction of prominent capitalized names
        candidates = re.findall(r"\b([A-Z][a-zA-Z0-9&\.\-]+(?: [A-Z][a-zA-Z0-9&\.\-]+)*)\b", text)
        for cand in candidates:
            for known in KNOWN_COMPANIES:
                if fuzz.ratio(cand.lower(), known.lower()) > 90:
                    return known
        return None

    async def analyze(self, text: str, **kwargs) -> DetectorResult:
        text = clean_text(text)
        text_lower = text.lower()

        score = 0.0
        signals: list[str] = []
        spans: list[dict] = []

        detected_company = self._extract_company(text)
        is_premium = detected_company in PREMIUM_COMPANIES

        # ── 1. Red-flag pattern scan ──────────────────────────────────────────
        for pattern, label, weight in RED_FLAG_PATTERNS:
            # Skip "Unrealistic earnings" if it's a premium company
            if is_premium and label == "Unrealistic earnings claim":
                continue
            if re.search(pattern, text_lower):
                score += weight
                signals.append(label)
                matched_spans = find_spans(text, [
                    m.group() for m in re.finditer(pattern, text_lower)
                ])
                for sp in matched_spans:
                    sp["reason"] = label
                spans.extend(matched_spans)

        # ── 2. Smart Salary normalization & anomaly detection ─────────────────
        # Regex handles: $, ₹, £, €, C$, Rs, CAD, INR, ranges and k/m abbreviations
        salary_matches = re.finditer(
            r"([\$₹£€]|c\$|rs\.?|cad|inr)\s*([\d,]+(?:\.\d+)?)\s*([km])?(?:\s*-\s*[\$₹£€c\$rs\.?|cad|inr]*\s*([\d,]+(?:\.\d+)?)\s*([km])?)?\s*(?:per\s*(month|year|week|hour|annum|mo|yr))?",
            text_lower
        )
        
        for match in salary_matches:
            try:
                symbol = match.group(1)
                
                def parse_val(val_str, multiplier_str):
                    if not val_str: return None
                    v = float(val_str.replace(",", ""))
                    if multiplier_str == 'k': v *= 1000
                    elif multiplier_str == 'm': v *= 1000000
                    return v

                amount_low = parse_val(match.group(2), match.group(3))
                amount_high = parse_val(match.group(4), match.group(5)) or amount_low
                
                if amount_low is None: continue

                period = match.group(6) or ""
                
                rate = CURRENCY_RATES.get(symbol, 1.0)
                avg_amount = (amount_low + amount_high) / 2
                
                # Smart Heuristic: If amount is > 10,000 and no period is specified, assume Annual
                if avg_amount > 10000 and not period:
                    period = "year"
                
                # Normalize to monthly USD
                monthly_usd = {
                    "year": (avg_amount * rate) / 12,
                    "annum": (avg_amount * rate) / 12,
                    "yr": (avg_amount * rate) / 12,
                    "week": (avg_amount * rate) * 4,
                    "hour": (avg_amount * rate) * 160,
                    "month": (avg_amount * rate),
                    "mo": (avg_amount * rate),
                    "": (avg_amount * rate) / 12 if avg_amount > 10000 else (avg_amount * rate),
                }.get(period, avg_amount * rate)

                # Check plausibility
                if monthly_usd > MAX_REALISTIC_MONTHLY_SALARY:
                    # If it's a premium company, we allow much higher salaries
                    if is_premium and monthly_usd < MAX_REALISTIC_MONTHLY_SALARY * 2.5:
                        signals.append(f"High-value role verified for {detected_company}")
                    else:
                        score += 12
                        signals.append(f"Unrealistic salary: {symbol}{match.group(2)}{match.group(3) or ''}/{period or 'stated'}")
                        spans.extend(find_spans(text, [match.group(0)]))
            except (ValueError, TypeError, IndexError):
                continue # Skip malformed matches

        # ── 3. Company name fuzzy-match (spoofing detection) ──────────────────
        candidates = re.findall(r"\b([A-Z][a-zA-Z0-9&\.\-]+(?: [A-Z][a-zA-Z0-9&\.\-]+)*)\b", text)
        for candidate in candidates:
            for known in KNOWN_COMPANIES:
                ratio = fuzz.ratio(candidate.lower(), known.lower())
                if SPOOF_THRESHOLD <= ratio < 100:
                    score += 14
                    signal = f"Possible impersonation: '{candidate}' resembles '{known}'"
                    signals.append(signal)
                    spans.extend(find_spans(text, [candidate]))
                    break

        # ── 4. Premium Discount ───────────────────────────────────────────────
        if is_premium and score < 30:
            # Legitimate tech giants with clean professional text get a discount
            score = max(0, score - 15)
            signals.append(f"Verified high-trust employer: {detected_company}")

        # ── 5. Structural red flags ───────────────────────────────────────────
        if word_count(text) < 50:
            score += 15
            signals.append("Unusually short job posting")

        if count_uppercase_ratio(text) > 0.4: # Increased threshold for professional job titles
            score += 12
            signals.append("Excessive capitalization")

        emails = extract_emails(text)
        for email in emails:
            domain = email.split("@")[-1].lower()
            if any(d in domain for d in ["gmail", "yahoo", "hotmail", "outlook.com", "aol"]):
                score += 10
                signals.append(f"Personal email used for recruitment: {email}")
                spans.extend(find_spans(text, [email]))

        score = min(score, 100.0)
        confidence = min(len(signals) * 15.0, 95.0) if signals else 10.0

        return DetectorResult(
            score=round(score, 2),
            confidence=round(confidence, 2),
            signals=list(dict.fromkeys(signals)),
            spans=spans,
            metadata={
                "detected_company": detected_company,
                "is_premium": is_premium,
                "currency_detected": symbol if 'symbol' in locals() else None
            },
        )

