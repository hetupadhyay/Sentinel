# backend/app/detectors/ai_content.py

import re
import math
import statistics
from typing import List, Tuple

from app.detectors.base import BaseDetector, DetectorResult
from app.utils.text_utils import (
    clean_text, sentence_tokenize, word_count,
    avg_word_length, count_uppercase_ratio,
)


# ── Vocabulary richness thresholds ────────────────────────────────────────────
# Type-Token Ratio (TTR): unique_words / total_words
# Human text tends to have higher TTR than AI (which repeats transitions)
TTR_AI_THRESHOLD = 0.45          # Below this = low lexical diversity (AI signal)

# ── Burstiness thresholds ─────────────────────────────────────────────────────
# Burstiness = (std - mean) / (std + mean) of sentence lengths
# Human writing has high burstiness (varied sentence lengths)
# AI writing trends toward low burstiness (uniform sentence lengths)
BURSTINESS_AI_THRESHOLD = -0.05  # Below this = suspiciously uniform

# ── Average sentence length ───────────────────────────────────────────────────
# AI tends to produce consistently medium-length sentences (15–25 words)
AI_SENT_LEN_MIN = 15
AI_SENT_LEN_MAX = 25

# ── Transition phrase fingerprints ───────────────────────────────────────────
# Phrases disproportionately common in LLM-generated text
AI_TRANSITION_PHRASES = [
    "it is worth noting",
    "it is important to note",
    "in conclusion",
    "in summary",
    "to summarize",
    "furthermore",
    "moreover",
    "additionally",
    "it should be noted",
    "as mentioned earlier",
    "as previously stated",
    "on the other hand",
    "in other words",
    "that being said",
    "with that said",
    "needless to say",
    "it goes without saying",
    "this underscores",
    "this highlights",
    "this demonstrates",
    "plays a crucial role",
    "plays a pivotal role",
    "it is essential to",
    "it is crucial to",
    "a comprehensive",
    "a holistic",
    "a multifaceted",
    "seamlessly",
    "leveraging",
    "delve into",
    "dive into",
    "in the realm of",
    "at the end of the day",
    "unlock the potential",
]

# ── Structural AI patterns ────────────────────────────────────────────────────
AI_STRUCTURAL_PATTERNS = [
    # Numbered list headers (1. ... 2. ... 3. ...)
    (r"^\s*\d+\.\s+[A-Z]", "Numbered list structure (common in AI output)"),
    # Markdown-style bold headers
    (r"\*\*[A-Za-z ]{3,40}\*\*", "Markdown bold headers detected"),
    # Repetitive paragraph openers
    (r"(^|\n)(First|Second|Third|Finally|Lastly|In addition)[,:]",
     "Sequential paragraph openers (AI structure)"),
]


class AIContentDetector(BaseDetector):
    """
    Estimates likelihood that input text was AI-generated using:

    1. Perplexity proxy — measures lexical predictability via unigram entropy.
       Low entropy = repetitive/predictable vocabulary = AI signal.

    2. Burstiness analysis — measures variance in sentence lengths.
       Low burstiness = uniform sentence lengths = AI signal.

    3. Transition phrase fingerprinting — known LLM-favored phrases.

    4. Type-Token Ratio (TTR) — lexical diversity measure.
       Low TTR = limited vocabulary reuse = AI signal.

    5. Structural pattern matching — markdown headers, numbered lists.

    Note: This is a heuristic detector without a loaded ML model.
    For production, replace the perplexity proxy with a real GPT-2
    perplexity scorer using HuggingFace Transformers (see comments below).
    """

    async def analyze(self, text: str, **kwargs) -> DetectorResult:
        text = clean_text(text)
        text_lower = text.lower()
        sentences = sentence_tokenize(text)
        words = text.split()

        score = 0.0
        signals: list[str] = []
        spans: list[dict] = []
        evidence: dict = {}

        if len(words) < 20:
            # Too short to analyze reliably
            return DetectorResult(
                score=0.0,
                confidence=5.0,
                signals=["Text too short for AI detection (< 20 words)"],
                spans=[],
                metadata={"confidence_percent": 0.0},
            )

        # ── 1. Perplexity proxy (unigram entropy) ─────────────────────────────
        # Real implementation would use:
        #   from transformers import GPT2LMHeadModel, GPT2TokenizerFast
        #   model = GPT2LMHeadModel.from_pretrained("gpt2")
        #   ...compute token log-probabilities and average them...
        # Here we approximate using unigram frequency entropy as a proxy.
        word_freq: dict[str, int] = {}
        for w in words:
            w_clean = re.sub(r"[^a-z]", "", w.lower())
            if w_clean:
                word_freq[w_clean] = word_freq.get(w_clean, 0) + 1

        total = sum(word_freq.values())
        # Shannon entropy of the unigram distribution
        entropy = -sum(
            (c / total) * math.log2(c / total)
            for c in word_freq.values()
            if c > 0
        )
        # Normalize entropy to 0–1 range (empirical max ~10 bits for natural text)
        normalized_entropy = min(entropy / 10.0, 1.0)

        # Low entropy = low diversity = more predictable = AI-like
        if normalized_entropy < 0.55:
            score += 20
            signals.append(f"Low lexical entropy ({entropy:.2f} bits) — predictable vocabulary")
        elif normalized_entropy < 0.65:
            score += 10
            signals.append(f"Below-average lexical entropy ({entropy:.2f} bits)")

        evidence["lexical_entropy"] = round(entropy, 4)
        evidence["normalized_entropy"] = round(normalized_entropy, 4)

        # ── 2. Burstiness analysis ─────────────────────────────────────────────
        sent_lengths = [len(s.split()) for s in sentences if s.strip()]

        if len(sent_lengths) >= 3:
            mean_len = statistics.mean(sent_lengths)
            std_len = statistics.stdev(sent_lengths) if len(sent_lengths) > 1 else 0.0
            denom = std_len + mean_len
            burstiness = (std_len - mean_len) / denom if denom else 0.0

            evidence["burstiness"] = round(burstiness, 4)
            evidence["mean_sentence_len"] = round(mean_len, 2)
            evidence["std_sentence_len"] = round(std_len, 2)

            if burstiness < BURSTINESS_AI_THRESHOLD:
                score += 18
                signals.append(
                    f"Low sentence burstiness ({burstiness:.3f}) — unnaturally uniform sentence lengths"
                )

            # Average sentence length in AI sweet spot
            if AI_SENT_LEN_MIN <= mean_len <= AI_SENT_LEN_MAX:
                score += 8
                signals.append(
                    f"Average sentence length ({mean_len:.1f} words) matches AI writing pattern"
                )

        # ── 3. Type-Token Ratio ───────────────────────────────────────────────
        unique_words = len(set(w.lower() for w in words))
        ttr = unique_words / len(words) if words else 0.0
        evidence["type_token_ratio"] = round(ttr, 4)

        if ttr < TTR_AI_THRESHOLD:
            score += 15
            signals.append(f"Low Type-Token Ratio ({ttr:.3f}) — limited vocabulary diversity")

        # ── 4. Transition phrase fingerprinting ───────────────────────────────
        transition_hits: list[str] = []
        for phrase in AI_TRANSITION_PHRASES:
            if phrase in text_lower:
                transition_hits.append(phrase)
                # Highlight the phrase in the original text
                idx = text_lower.find(phrase)
                while idx != -1:
                    spans.append({
                        "start": idx,
                        "end": idx + len(phrase),
                        "text": text[idx: idx + len(phrase)],
                        "reason": "AI transition phrase fingerprint",
                    })
                    idx = text_lower.find(phrase, idx + 1)

        evidence["transition_phrases_hit"] = transition_hits

        if len(transition_hits) >= 3:
            phrase_score = min(len(transition_hits) * 5, 20)
            score += phrase_score
            signals.append(
                f"{len(transition_hits)} AI transition phrases detected: "
                f"{', '.join(transition_hits[:4])}{'...' if len(transition_hits) > 4 else ''}"
            )
        elif len(transition_hits) >= 1:
            score += len(transition_hits) * 3
            signals.append(f"AI transition phrase(s) detected: {', '.join(transition_hits)}")

        # ── 5. Structural pattern matching ────────────────────────────────────
        for pattern, label in AI_STRUCTURAL_PATTERNS:
            matches = re.findall(pattern, text, re.MULTILINE)
            if matches:
                score += 7
                signals.append(label)

        # ── 6. Paragraph homogeneity ──────────────────────────────────────────
        # AI often produces paragraphs of very similar word counts
        paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
        if len(paragraphs) >= 3:
            para_lengths = [len(p.split()) for p in paragraphs]
            para_std = statistics.stdev(para_lengths) if len(para_lengths) > 1 else 0
            para_mean = statistics.mean(para_lengths)
            if para_mean > 0 and (para_std / para_mean) < 0.2:
                score += 10
                signals.append("Suspiciously uniform paragraph lengths (AI structure)")

        # ── Normalize and compute confidence ─────────────────────────────────
        score = min(score, 100.0)

        # Confidence is high when multiple independent signals agree
        independent_signals = sum([
            normalized_entropy < 0.65,
            burstiness < BURSTINESS_AI_THRESHOLD if len(sent_lengths) >= 3 else False,
            ttr < TTR_AI_THRESHOLD,
            len(transition_hits) >= 2,
        ])
        confidence = min(independent_signals * 22.0 + 10.0, 95.0)

        evidence["ai_probability_percent"] = round(score, 2)

        return DetectorResult(
            score=round(score, 2),
            confidence=round(confidence, 2),
            signals=list(dict.fromkeys(signals)),
            spans=spans,
            metadata=evidence,
        )
