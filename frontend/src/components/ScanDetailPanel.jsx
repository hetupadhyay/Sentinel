// frontend/src/components/ScanDetailPanel.jsx
// Sentinel — Slide-in detail panel for scan results (right side)

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { X, ExternalLink, ShieldAlert, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import client from '@/api/client';
import { getRiskConfig, formatScore, formatConfidence, formatDate } from '@/utils/formatters';
import { ATTACK_ICONS, ATTACK_COLORS, SCAN_TYPE_LABELS } from '@/utils/constants';
import { Badge } from '@/components/ui/Badge';

function RiskMeterSmall({ score, level }) {
  const cfg = getRiskConfig(level);
  const safeScore = typeof score === 'number' && !Number.isNaN(score) ? score : 0;
  const pct = Math.min(safeScore, 100);

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <span className="text-[28px] font-bold font-mono tracking-tight" style={{ color: cfg.color }}>
          {formatScore(safeScore)}
        </span>
        <Badge variant={level.toLowerCase()} dot>{level}</Badge>
      </div>
      <div className="h-1 rounded-full bg-background-border overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: cfg.color }}
        />
      </div>
    </div>
  );
}

function AttackRow({ classification }) {
  const { attack_type, confidence, description } = classification;
  const iconName = ATTACK_ICONS[attack_type] ?? 'HelpCircle';
  const color = ATTACK_COLORS[attack_type] ?? 'var(--text-muted)';
  const Icon = LucideIcons[iconName] ?? LucideIcons.HelpCircle;
  const safeConf = typeof confidence === 'number' && !Number.isNaN(confidence) ? confidence : 0;

  return (
    <div className="flex items-start gap-2.5 py-2.5">
      <div className="flex items-center justify-center w-6 h-6 rounded shrink-0 mt-0.5"
           style={{ background: `${color}15` }}>
        <Icon size={13} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[12px] font-medium text-text-primary truncate">{attack_type}</span>
          <span className="text-[11px] font-mono shrink-0" style={{ color }}>
            {formatConfidence(safeConf)}
          </span>
        </div>
        {description && (
          <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed">{description}</p>
        )}
      </div>
    </div>
  );
}

export default function ScanDetailPanel({ scanId, onClose }) {
  const [result, setResult] = useState(null);
  const [scan, setScan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!scanId) return;
    setLoading(true);
    setError(null);
    client.get(`/api/v1/history/${scanId}`)
      .then(({ data }) => {
        setScan(data);
        setResult(data.report);
      })
      .catch(() => setError('Failed to load scan.'))
      .finally(() => setLoading(false));
  }, [scanId]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!scanId) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[50] bg-black/20 dark:bg-black/40 animate-overlay-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-12 right-0 bottom-0 z-[51] w-full max-w-md
                      border-l border-background-border bg-background
                      overflow-y-auto animate-slide-in-right">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-3
                        border-b border-background-border bg-background/90 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-text-muted">#{scanId}</span>
            {scan && (
              <span className="text-[11px] text-text-muted">
                · {SCAN_TYPE_LABELS[scan.scan_type] ?? scan.scan_type}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Link
              to={`/app/results/${scanId}`}
              className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium
                         text-text-secondary hover:text-text-primary hover:bg-background-hover transition-colors"
            >
              Full Report <ExternalLink size={11} />
            </Link>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-7 h-7 rounded-md
                         text-text-muted hover:text-text-primary hover:bg-background-hover transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={20} className="animate-spin text-accent" />
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <p className="text-[13px] text-risk-critical">{error}</p>
            </div>
          ) : result ? (
            <>
              {/* Risk Score */}
              <RiskMeterSmall score={result.risk_score} level={result.risk_level || 'safe'} />

              {/* Meta */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-text-secondary">
                <span>Confidence: <strong className="text-text-primary">{formatConfidence(result.confidence || 0)}</strong></span>
                <span>Signals: <strong className="text-text-primary">{(result.signals_triggered || []).length}</strong></span>
                {scan?.created_at && (
                  <span>{formatDate(scan.created_at)}</span>
                )}
              </div>

              {/* Recommendation */}
              {result.recommendation && (
                <div className="space-y-1.5">
                  <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider">Recommendation</p>
                  <div className="flex items-start gap-2">
                    {['safe', 'low'].includes(result.risk_level)
                      ? <CheckCircle2 size={14} className="text-risk-safe mt-0.5 shrink-0" />
                      : <ShieldAlert size={14} className="shrink-0 mt-0.5" style={{ color: getRiskConfig(result.risk_level).color }} />
                    }
                    <p className="text-[12px] text-text-secondary leading-relaxed">{result.recommendation}</p>
                  </div>
                </div>
              )}

              {/* Signals */}
              {result.signals_triggered?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider">
                    Signals ({result.signals_triggered.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.signals_triggered.map((sig, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded
                                               bg-background-surface border border-background-border
                                               text-[10px] text-text-secondary">
                        <AlertTriangle size={9} className="text-risk-medium" />
                        {sig}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Attack Classification */}
              {result.attack_classification?.length > 0 && (
                <div className="space-y-1">
                  <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider">
                    Attack Classification
                  </p>
                  <div className="divide-y divide-background-border">
                    {result.attack_classification
                      .filter(a => a.attack_type !== 'Unknown / Other')
                      .map((a, i) => <AttackRow key={i} classification={a} />)}
                  </div>
                </div>
              )}

              {/* Input preview */}
              {(scan?.input_text || scan?.input_url) && (
                <div className="space-y-1.5">
                  <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider">Input</p>
                  <div className="rounded-md bg-background-surface border border-background-border p-3 max-h-32 overflow-y-auto">
                    <p className="text-[11px] text-text-secondary leading-relaxed whitespace-pre-wrap break-words">
                      {scan.input_text || scan.input_url}
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}
