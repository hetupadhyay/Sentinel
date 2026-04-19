// frontend/src/utils/formatters.js
// Sentinel — Formatting utilities used across Dashboard, Results, and History pages

/**
 * Returns visual configuration for a given risk level.
 * Used for badges, meters, glows, and color-coded UI elements.
 */
export function getRiskConfig(level) {
  const map = {
    critical: {
      color: 'var(--risk-critical)',
      bg: 'bg-risk-critical/10',
      textClass: 'text-risk-critical',
      border: 'border-risk-critical/20',
      label: 'Critical',
    },
    high: {
      color: 'var(--risk-high)',
      bg: 'bg-risk-high/10',
      textClass: 'text-risk-high',
      border: 'border-risk-high/20',
      label: 'High',
    },
    medium: {
      color: 'var(--risk-medium)',
      bg: 'bg-risk-medium/10',
      textClass: 'text-risk-medium',
      border: 'border-risk-medium/20',
      label: 'Medium',
    },
    low: {
      color: 'var(--risk-low)',
      bg: 'bg-risk-low/10',
      textClass: 'text-risk-low',
      border: 'border-risk-low/20',
      label: 'Low',
    },
    safe: {
      color: 'var(--risk-safe)',
      bg: 'bg-risk-safe/10',
      textClass: 'text-risk-safe',
      border: 'border-risk-safe/20',
      label: 'Safe',
    },
  };
  return map[level] ?? map.safe;
}


/**
 * Formats an ISO date string into a human-readable relative or absolute form.
 * - Under 1 minute:  "just now"
 * - Under 1 hour:    "Xm ago"
 * - Under 24 hours:  "Xh ago"
 * - Under 7 days:    "Xd ago"
 * - Older:           "Jan 5, 2025"
 */
export function formatDate(iso) {
  if (!iso) return '—';
  const date = new Date(iso);
  const now  = Date.now();
  const diff = now - date.getTime();

  const MINUTE = 60_000;
  const HOUR   = 3_600_000;
  const DAY    = 86_400_000;

  if (diff < MINUTE)     return 'just now';
  if (diff < HOUR)       return `${Math.floor(diff / MINUTE)}m ago`;
  if (diff < DAY)        return `${Math.floor(diff / HOUR)}h ago`;
  if (diff < DAY * 7)    return `${Math.floor(diff / DAY)}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
}


/**
 * Truncates a string to `len` characters, appending "…" if truncated.
 */
export function truncate(str, len = 80) {
  if (!str) return '';
  if (str.length <= len) return str;
  return str.slice(0, len).trimEnd() + '…';
}


/**
 * Formats a numeric score to one decimal place.
 * e.g. 78.5 → "78.5", 0 → "0.0"
 */
export function formatScore(n) {
  if (typeof n !== 'number' || Number.isNaN(n)) return '0.0';
  return n.toFixed(1);
}


/**
 * Formats a confidence value as a percentage string.
 * e.g. 84.0 → "84.0%"
 */
export function formatConfidence(n) {
  if (typeof n !== 'number' || Number.isNaN(n)) return '0.0%';
  return `${n.toFixed(1)}%`;
}
