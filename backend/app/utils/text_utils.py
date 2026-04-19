# backend/app/utils/text_utils.py
import re
from typing import List

def clean_text(text: str) -> str:
    """Basic text cleanup."""
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def find_spans(text: str, targets: List[str]) -> List[dict]:
    """Find start and end indices of target strings in the text."""
    spans = []
    text_lower = text.lower()
    for target in set(targets):  # Use set to avoid duplicate searches
        target_lower = target.lower()
        if not target_lower:
            continue
        start = 0
        while True:
            start = text_lower.find(target_lower, start)
            if start == -1:
                break
            spans.append({
                "start": start,
                "end": start + len(target),
                "text": text[start:start + len(target)]
            })
            start += len(target)
    return spans

def count_uppercase_ratio(text: str) -> float:
    """Return the ratio of uppercase letters to total alphabetic characters."""
    if not text: return 0.0
    alpha_chars = [c for c in text if c.isalpha()]
    if not alpha_chars: return 0.0
    return sum(1 for c in alpha_chars if c.isupper()) / len(alpha_chars)

def count_exclamation_density(text: str) -> float:
    """Return the number of exclamation marks per 100 words."""
    words = word_count(text)
    if words == 0: return 0.0
    return (text.count("!") / words) * 100

def extract_emails(text: str) -> List[str]:
    """Extract all email addresses from the text."""
    return list(set(re.findall(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', text)))

def extract_urls(text: str) -> List[str]:
    """Extract all URLs from the text."""
    return list(set(re.findall(r'https?://[a-zA-Z0-9./_?=-]+', text)))

def word_count(text: str) -> int:
    """Return the number of words in the text."""
    return len(text.split())

def sentence_tokenize(text: str) -> List[str]:
    """Basic sentence tokenizer."""
    return [s.strip() for s in re.split(r'(?<=[.!?])\s+', text) if s.strip()]

def avg_word_length(text: str) -> float:
    """Return the average length of words in the text."""
    words = text.split()
    if not words: return 0.0
    return sum(len(w) for w in words) / len(words)
