# backend/app/utils/text_utils.py

import re
from typing import List, Tuple


def clean_text(text: str) -> str:
    """Strip excess whitespace and normalize unicode dashes/quotes."""
    text = text.strip()
    text = re.sub(r"\s+", " ", text)
    # Normalize unicode dashes to ASCII hyphen
    text = text.replace("\u2013", "-").replace("\u2014", "-")
    return text


def find_spans(text: str, phrases: List[str]) -> List[dict]:
    """
    Return character-level span dicts for every occurrence of each phrase.
    Case-insensitive. Used to populate highlighted_spans in results.
    """
    spans = []
    text_lower = text.lower()
    for phrase in phrases:
        phrase_lower = phrase.lower()
        start = 0
        while True:
            idx = text_lower.find(phrase_lower, start)
            if idx == -1:
                break
            spans.append({
                "start": idx,
                "end": idx + len(phrase),
                "text": text[idx: idx + len(phrase)],
                "reason": f"Matched high-risk pattern: '{phrase}'",
            })
            start = idx + 1
    return spans


def sentence_tokenize(text: str) -> List[str]:
    """
    Naive sentence splitter — avoids NLTK download requirement at runtime.
    Splits on '.', '!', '?' followed by whitespace or end-of-string.
    """
    sentences = re.split(r"(?<=[.!?])\s+", text.strip())
    return [s for s in sentences if s]


def word_count(text: str) -> int:
    return len(text.split())


def avg_word_length(text: str) -> float:
    words = text.split()
    if not words:
        return 0.0
    return sum(len(w) for w in words) / len(words)


def count_uppercase_ratio(text: str) -> float:
    """Fraction of alphabetic characters that are uppercase."""
    alpha = [c for c in text if c.isalpha()]
    if not alpha:
        return 0.0
    return sum(1 for c in alpha if c.isupper()) / len(alpha)


def count_exclamation_density(text: str) -> float:
    """Exclamation marks per 100 characters."""
    if not text:
        return 0.0
    return (text.count("!") / len(text)) * 100


def extract_emails(text: str) -> List[str]:
    return re.findall(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}", text)


def extract_urls(text: str) -> List[str]:
    return re.findall(
        r"https?://[^\s\"'<>]+|www\.[^\s\"'<>]+",
        text,
    )


def extract_phone_numbers(text: str) -> List[str]:
    return re.findall(
        r"(?:\+?\d{1,3}[\s\-]?)?(?:\(?\d{3}\)?[\s\-]?)?\d{3}[\s\-]?\d{4}",
        text,
    )
