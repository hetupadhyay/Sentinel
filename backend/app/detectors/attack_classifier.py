# backend/app/detectors/attack_classifier.py

import re
from typing import List

from app.detectors.base import BaseDetector, DetectorResult
from app.schemas.attack import AttackClassification
from app.utils.text_utils import clean_text, find_spans, extract_urls


# ── Attack type rule definitions ──────────────────────────────────────────────
# Each rule: (attack_label, description_template, [(pattern, weight), ...], min_score)
# Patterns are matched case-insensitively against the full input text.
# min_score = minimum weighted hit total before this label is emitted.

ATTACK_RULES: List[tuple] = [

    (
        "Phishing",
        "Message contains deceptive credential-harvesting patterns and spoofed sender/URL indicators.",
        [
            (r"\b(verify|confirm|update).{0,20}(account|password|credentials|banking details)\b", 20),
            (r"\bclick\s+(here|the\s+link|below).{0,30}(login|verify|confirm)\b", 20),
            (r"\b(your\s+account\s+(has\s+been|will\s+be)\s+(suspended|locked|disabled))\b", 18),
            (r"\bphishing\b", 25),
            (r"\b(enter|re-?enter).{0,15}(password|pin|otp)\b", 18),
            (r"https?://[^\s]{0,60}(login|signin|verify|secure|account)[^\s]*", 15),
        ],
        25,
    ),

    (
        "Spear Phishing",
        "Targeted phishing using personal context, named individuals, or role-specific lures.",
        [
            (r"\bdear\s+[A-Z][a-z]+\b", 12),              # Personalized salutation
            (r"\bas\s+(per\s+our\s+(last\s+)?conversation|discussed)\b", 10),
            (r"\byour\s+(manager|ceo|cfo|director|supervisor).{0,30}(asked|requested|authorized)\b", 20),
            (r"\bbusiness\s+email\s+compromise\b", 25),
            (r"\bwire\s+transfer.{0,30}(urgent|immediately|today)\b", 18),
            (r"\b(invoice|payment).{0,20}(attached|updated|changed|new\s+account)\b", 14),
        ],
        22,
    ),

    (
        "Vishing",
        "Voice-based social engineering indicators — phone numbers, call-back demands, IVR spoofing.",
        [
            (r"\bcall\s+(us|me|back|now|immediately).{0,30}(\+?\d[\d\s\-]{7,})", 18),
            (r"\b(toll[- ]free|helpline|customer\s+care).{0,20}\d{7,}\b", 14),
            (r"\bpress\s+\d\s+(to|for)\b", 15),            # IVR prompt
            (r"\byour\s+(ssn|social\s+security|tax\s+id).{0,20}(compromised|stolen|used)\b", 20),
            (r"\bdo\s+not\s+hang\s+up\b", 15),
            (r"\bspeak\s+(to|with)\s+(an?\s+)?(agent|representative|officer)\b", 10),
        ],
        22,
    ),

    (
        "Smishing",
        "SMS-based phishing — short URLs, mobile-specific lures, delivery/prize scam patterns.",
        [
            (r"\b(sms|text\s+message|txt)\b.{0,30}(click|link|confirm)\b", 16),
            (r"\byour\s+(package|parcel|delivery).{0,30}(failed|held|waiting)\b", 14),
            (r"\breply\s+(yes|y|stop|confirm)\b", 12),
            (r"(bit\.ly|tinyurl|t\.co|rb\.gy|cutt\.ly)/[^\s]+", 14),  # Short URLs in SMS
            (r"\bfree\s+(msg|message|sms)\b", 10),
            (r"\bopt[\s-]?out\b.{0,20}(text|reply|sms)\b", 10),
        ],
        20,
    ),

    (
        "Ransomware",
        "Extortion-based threat language, encryption threats, or ransom payment demands.",
        [
            (r"\b(files?|data|documents?).{0,20}(encrypted|locked|held\s+hostage)\b", 25),
            (r"\b(pay|send).{0,20}(bitcoin|btc|monero|xmr|cryptocurrency).{0,20}(to\s+decrypt|to\s+restore|ransom)\b", 28),
            (r"\bransom(ware|note|demand)?\b", 25),
            (r"\byou\s+have\s+\d+\s+(hours?|days?).{0,20}(pay|transfer|send)\b", 18),
            (r"\b(decryption\s+key|unlock\s+code).{0,20}(provided|sent|after\s+payment)\b", 22),
            (r"\b(tor\s+browser|\.onion)\b", 16),
        ],
        25,
    ),

    (
        "Social Engineering",
        "Psychological manipulation tactics detected — authority, urgency, fear, or reciprocity triggers.",
        [
            (r"\b(act\s+now|respond\s+immediately|urgent(ly)?)\b", 10),
            (r"\b(limited\s+(time|offer|slots?)|expires?\s+(today|soon))\b", 10),
            (r"\b(you\s+have\s+been\s+selected|exclusively\s+chosen|pre[-\s]?approved)\b", 12),
            (r"\b(don[''']t\s+tell|keep\s+this\s+(secret|confidential|between\s+us))\b", 16),
            (r"\b(gift|reward|prize).{0,20}(claim|collect|redeem)\b", 10),
            (r"\b(irs|fbi|police|court|legal\s+notice).{0,30}(action|arrest|fine|penalty)\b", 18),
        ],
        20,
    ),

    (
        "Impersonation",
        "Fake identity or brand spoofing detected — sender or content mimics a trusted entity.",
        [
            (r"\b(i\s+am|this\s+is).{0,20}(from|with|at).{0,20}(google|microsoft|amazon|apple|paypal|irs|fbi)\b", 20),
            (r"\bofficial\s+(notice|communication|representative|account)\b", 14),
            (r"\bdo\s+not\s+reply\s+to\s+this\s+email\b", 8),
            (r"\b(verified|authenticated|certified)\s+(account|profile|sender)\b", 12),
            (r"\b[a-z0-9._%+\-]+@(?!google\.com|microsoft\.com|amazon\.com)(google|microsoft|amazon|paypal)[a-z0-9\-]*\.[a-z]{2,}\b", 20),
            (r"\bacting\s+(ceo|cfo|director|manager)\b", 12),
        ],
        20,
    ),

    (
        "Job Scam",
        "Fraudulent job or recruiter offer — upfront fees, unrealistic pay, or personal data harvesting.",
        [
            (r"\b(registration\s+fee|security\s+deposit|training\s+fee).{0,20}(pay|send|transfer)\b", 22),
            (r"\bearn.{0,15}\$\d{3,}.{0,10}(per\s+(day|week|hour)|daily|weekly)\b", 16),
            (r"\bno\s+(experience|interview|qualification)\s+(required|needed)\b", 14),
            (r"\bwork\s+from\s+(home|anywhere).{0,30}(\$|earn|income|salary)\b", 12),
            (r"\b(whatsapp|telegram).{0,20}(job|hiring|recruitment|offer)\b", 14),
            (r"\b(passport|national\s+id|ssn).{0,20}(copy|scan|photo|number)\b", 20),
        ],
        22,
    ),

    (
        "Advance Fee Fraud",
        "Upfront payment scam — victim asked to pay fees to receive a larger promised reward.",
        [
            (r"\b(million(s?)|billion(s?)).{0,20}(transfer|deposit|inheritance|fund)\b", 18),
            (r"\b(next\s+of\s+kin|beneficiary|heir).{0,30}(claim|transfer|funds)\b", 20),
            (r"\b(processing\s+fee|transfer\s+fee|release\s+fee).{0,20}(pay|send|required)\b", 22),
            (r"\b(nigerian?\s+(prince|official|government)|419\s+scam)\b", 25),
            (r"\bconfidential\s+(business|transaction|proposal)\b.{0,40}(\$|usd|million)\b", 16),
            (r"\bshare\s+(percentage|percent|%).{0,20}(profit|funds|sum)\b", 14),
        ],
        22,
    ),

    (
        "MITM (Man-in-the-Middle)",
        "Indicators of intercepted or tampered communication — session hijacking, proxy, or replay patterns.",
        [
            (r"\b(ssl\s+strip(ping)?|https?\s+downgrade)\b", 22),
            (r"\b(arp\s+(spoof(ing)?|poison(ing)?))\b", 22),
            (r"\b(session\s+(hijack(ing)?|fixation|replay))\b", 20),
            (r"\b(evil\s+twin|rogue\s+(ap|access\s+point|hotspot))\b", 20),
            (r"\b(intercept(ed|ing)?|sniff(ed|ing)?)\s+(traffic|packets?|credentials?)\b", 18),
            (r"\b(man[\s-]in[\s-]the[\s-]middle|mitm)\b", 25),
        ],
        20,
    ),

    (
        "SQL Injection",
        "SQL injection patterns detected in input — attempt to manipulate database queries.",
        [
            (r"(--|#|/\*).*(select|insert|update|delete|drop|union)", 22),
            (r"\b(union\s+(all\s+)?select)\b", 25),
            (r"('\s*(or|and)\s*'?\d+'\s*=\s*'?\d+)", 25),    # ' OR '1'='1
            (r"\b(drop\s+(table|database|schema))\b", 25),
            (r"\b(exec(ute)?\s*\(|xp_cmdshell|sp_executesql)\b", 22),
            (r"(%27|%3D|%3B|%2D%2D)",                          18),   # URL-encoded SQL chars
        ],
        22,
    ),

    (
        "XSS (Cross-Site Scripting)",
        "Script injection patterns detected — attempt to execute malicious code in a browser context.",
        [
            (r"<\s*script[^>]*>", 25),
            (r"javascript\s*:", 22),
            (r"on(load|click|mouseover|error|focus|blur)\s*=", 20),
            (r"<\s*img[^>]+src\s*=\s*['\"]?\s*javascript:", 22),
            (r"(%3Cscript|%3E|%22|%27).*(alert|document\.cookie|xss)", 20),
            (r"\balert\s*\(\s*['\"]?(xss|1|document)", 20),
        ],
        20,
    ),

    (
        "DDoS Indicators",
        "References to botnet activity, coordinated attack infrastructure, or volumetric attack language.",
        [
            (r"\b(botnet|bot\s+army|zombie\s+(network|machines?))\b", 22),
            (r"\b(ddos|distributed\s+denial[\s-]of[\s-]service)\b", 25),
            (r"\b(flood(ing)?|amplification)\s+(attack|traffic|packets?)\b", 18),
            (r"\b(c2|command[\s-]and[\s-]control|c&c)\s+(server|infrastructure)\b", 20),
            (r"\b(syn\s+flood|udp\s+flood|http\s+flood|ntp\s+amplification)\b", 20),
            (r"\b(mirai|emotet|trickbot|qakbot)\b", 22),    # Known botnet names
        ],
        20,
    ),

    (
        "Credential Stuffing",
        "Bulk login attempt indicators — references to combo lists, data breaches, or account takeover tools.",
        [
            (r"\b(credential\s+stuff(ing)?|account\s+takeover)\b", 25),
            (r"\b(combo\s+list|combolist|breach\s+(data|dump|list))\b", 22),
            (r"\b(leaked?\s+(passwords?|credentials?|logins?|database))\b", 20),
            (r"\b(brute[\s-]?force|password\s+spray(ing)?)\b", 18),
            (r"\b(openbullet|snipr|storm\s+private|sentryMBA)\b", 25),  # Attack tools
            (r"\b(valid\s+hits?|checker\s+(result|log)|cracked\s+accounts?)\b", 20),
        ],
        20,
    ),

    (
        "Fake News / Disinformation",
        "Fabricated or manipulated news content detected — sensationalism, conspiracy framing, or vague sourcing.",
        [
            (r"\b(they\s+don[''']t\s+want\s+you\s+to\s+know|hidden\s+truth|suppressed\s+(by|news))\b", 18),
            (r"\b(mainstream\s+media|msm|fake\s+news|lamestream)\b.{0,20}(lies?|hiding|suppressing|won[''']t\s+tell)\b", 16),
            (r"\b(deep\s+state|globalist|plandemic|scamdemic|chemtrails?)\b", 18),
            (r"\b(share\s+before\s+(it[''']s\s+)?(deleted|removed|banned|censored))\b", 16),
            (r"\b(anonymous\s+source|source\s+close\s+to).{0,30}(claims?|says?|told\s+us)\b", 12),
            (r"\b(100\s*%\s*(proven|confirmed)|undeniable\s+proof|absolute\s+(truth|fact))\b", 14),
        ],
        22,
    ),

    (
        "AI-Generated Content",
        "Text exhibits statistical and linguistic patterns consistent with large language model output.",
        [
            (r"\b(it\s+is\s+(worth|important)\s+noting|furthermore|moreover|additionally)\b", 8),
            (r"\b(in\s+conclusion|to\s+summarize|in\s+summary|that\s+being\s+said)\b", 8),
            (r"\b(plays\s+a\s+(crucial|pivotal|key)\s+role|seamlessly\s+(integrates?|combines?))\b", 10),
            (r"\b(delve\s+into|dive\s+deeper|unpack\s+this|leverage[sd]?)\b", 8),
            (r"\b(comprehensive(ly)?|holistic(ally)?|multifaceted)\b", 7),
            (r"\b(as\s+(an?\s+)?ai\s+(language\s+)?model|i\s+don[''']t\s+have\s+(the\s+ability|access\s+to))\b", 25),
        ],
        20,
    ),
]

# Fallback when no rule reaches its min_score
UNKNOWN_CLASSIFICATION = AttackClassification(
    attack_type="Unknown / Other",
    confidence=0.0,
    description="No recognizable attack pattern matched the input with sufficient confidence.",
)


class AttackClassifier(BaseDetector):
    """
    Multi-label attack type classifier.

    Evaluates the full set of ATTACK_RULES against the input text.
    Each rule that crosses its min_score threshold emits an AttackClassification
    entry. Multiple labels can fire on the same input.

    Always returns at least one entry — falls back to 'Unknown / Other'.

    Results are stored in DetectorResult.metadata["attack_classifications"]
    and consumed directly by the ExplainabilityEngine.
    """

    async def analyze(self, text: str, **kwargs) -> DetectorResult:
        text_clean = clean_text(text)
        text_lower = text_clean.lower()

        classifications: list[AttackClassification] = []
        all_signals: list[str] = []
        all_spans: list[dict] = []

        for attack_label, description, patterns, min_score in ATTACK_RULES:
            raw_score = 0.0
            hit_spans: list[dict] = []

            for pattern, weight in patterns:
                for m in re.finditer(pattern, text_lower, re.IGNORECASE):
                    raw_score += weight
                    hit_spans.append({
                        "start": m.start(),
                        "end": m.end(),
                        "text": text_clean[m.start():m.end()],
                        "reason": f"[{attack_label}] pattern match",
                    })

            if raw_score >= min_score:
                # Normalize to 0–100 confidence (cap at 97 — model is not perfect)
                max_possible = sum(w for _, w in patterns) * 0.6   # 60% hit = full confidence
                confidence = min((raw_score / max(max_possible, 1)) * 100, 97.0)

                classifications.append(AttackClassification(
                    attack_type=attack_label,
                    confidence=round(confidence, 2),
                    description=description,
                ))
                all_signals.append(f"Attack type detected: {attack_label} ({confidence:.0f}% confidence)")
                all_spans.extend(hit_spans)

        # Sort by confidence descending
        classifications.sort(key=lambda c: c.confidence, reverse=True)

        # Always include at least the Unknown fallback if nothing fired
        if not classifications:
            classifications = [UNKNOWN_CLASSIFICATION]

        # Aggregate score = highest single attack confidence
        aggregate_score = classifications[0].confidence if classifications else 0.0

        return DetectorResult(
            score=round(aggregate_score, 2),
            confidence=round(aggregate_score, 2),
            signals=all_signals,
            spans=all_spans,
            metadata={
                "attack_classifications": [c.model_dump() for c in classifications],
                "total_attack_types_detected": len(classifications),
            },
        )
