export const formatDate = (dateStr: string) => {
  if (!dateStr) return '—';
  try {
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return '—';

    const now = Date.now();
    const diff = now - date.getTime();

    const MINUTE = 60_000;
    const HOUR = 3_600_000;
    const DAY = 86_400_000;

    if (diff < MINUTE) return 'just now';
    if (diff < HOUR) return `${Math.floor(diff / MINUTE)}m ago`;
    if (diff < DAY) return `${Math.floor(diff / HOUR)}h ago`;
    if (diff < DAY * 7) return `${Math.floor(diff / DAY)}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
  } catch (e) {
    return '—';
  }
};

/**
 * Formats a score (0-100) to one decimal place with a percentage.
 */
export const formatScore = (score: number) => {
  if (typeof score !== 'number' || Number.isNaN(score)) return '0.0%';
  // If the score is 0.85, we show 85.0%. If it's 85, we show 85.0%.
  // We'll assume the backend provides 0-100 for consistency with the old UI.
  return `${score.toFixed(1)}%`;
};

/**
 * Formats confidence (0-100) as percentage.
 */
export const formatConfidence = (conf: number) => {
  if (typeof conf !== 'number' || Number.isNaN(conf)) return '0.0%';
  return `${conf.toFixed(1)}%`;
};

export const getRiskConfig = (level: string) => {
  const l = (level || 'safe').toLowerCase();
  switch (l) {
    case 'critical':
      return { color: 'var(--risk-critical)', bg: 'bg-risk-critical/5', border: 'border-risk-critical/20' };
    case 'high':
      return { color: 'var(--risk-high)', bg: 'bg-risk-high/5', border: 'border-risk-high/20' };
    case 'medium':
      return { color: 'var(--risk-medium)', bg: 'bg-risk-medium/5', border: 'border-risk-medium/20' };
    case 'low':
      return { color: 'var(--risk-low)', bg: 'bg-risk-low/5', border: 'border-risk-low/20' };
    case 'safe':
    default:
      return { color: 'var(--risk-safe)', bg: 'bg-risk-safe/5', border: 'border-risk-safe/20' };
  }
};
