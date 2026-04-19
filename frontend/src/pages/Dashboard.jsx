// frontend/src/pages/Dashboard.jsx
// Sentinel — Primary product view: high-density scans feed (replaces old dashboard)
// NO stat cards, NO charts — just a workflow-focused scan list

import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ScanSearch, Loader2, Plus } from 'lucide-react';
import client from '@/api/client';
import { formatDate, truncate, formatScore } from '@/utils/formatters';
import { SCAN_TYPE_LABELS } from '@/utils/constants';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import ScanDetailPanel from '@/components/ScanDetailPanel';

const RISK_TABS = [
  { label: 'All', value: '' },
  { label: 'Critical', value: 'critical' },
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
  { label: 'Safe', value: 'safe' },
];

const riskColors = {
  critical: 'var(--risk-critical)',
  high: 'var(--risk-high)',
  medium: 'var(--risk-medium)',
  low: 'var(--risk-low)',
  safe: 'var(--risk-safe)',
};

export default function Dashboard() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [riskFilter, setRiskFilter] = useState('');
  const [selectedScanId, setSelectedScanId] = useState(null);
  const [total, setTotal] = useState(0);

  const fetchScans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: 1, page_size: 50 });
      if (riskFilter) params.set('risk_level', riskFilter);
      const { data } = await client.get(`/api/v1/history?${params}`);
      setScans(data.items ?? []);
      setTotal(data.total ?? 0);
    } catch {
      setError('Failed to load scans.');
    } finally {
      setLoading(false);
    }
  }, [riskFilter]);

  useEffect(() => { fetchScans(); }, [fetchScans]);

  // Empty state — no scans at all
  if (!loading && !error && scans.length === 0 && !riskFilter) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-5 animate-in px-6">
        <div className="w-14 h-14 rounded-xl bg-accent-muted border border-accent/15 flex items-center justify-center">
          <ScanSearch size={24} className="text-accent" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-text-primary tracking-tight mb-1.5">
            Welcome to Sentinel
          </h2>
          <p className="text-text-secondary max-w-sm mx-auto text-[13px] leading-relaxed">
            Your scan feed is empty. Run your first analysis to detect fraud, impersonation, or phishing.
          </p>
        </div>
        <Link to="/app/analyze">
          <Button variant="primary">
            <Plus size={14} /> New Scan
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-in">
      {/* ── Header bar ── */}
      <div className="border-b border-background-border bg-background sticky top-12 z-30">
        <div className="max-w-[1200px] mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <h1 className="text-[14px] font-semibold text-text-primary tracking-tight">Scans</h1>
              {!loading && (
                <span className="text-[11px] text-text-muted font-mono">{total}</span>
              )}
            </div>
            <Link to="/app/analyze">
              <Button variant="primary" className="h-8 px-3 text-[12px]">
                <Plus size={13} /> New Scan
              </Button>
            </Link>
          </div>

          {/* Risk filter tabs */}
          <div className="flex items-center gap-0.5 -mb-px">
            {RISK_TABS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setRiskFilter(value)}
                className={`px-3 py-2 text-[12px] font-medium border-b-2 transition-colors duration-100
                  ${riskFilter === value
                    ? 'text-text-primary border-accent'
                    : 'text-text-muted border-transparent hover:text-text-secondary hover:border-background-border'
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Scan list ── */}
      <div className="max-w-[1200px] mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={20} className="animate-spin text-accent" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-[13px] text-risk-critical">{error}</p>
          </div>
        ) : scans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <ScanSearch size={24} className="text-text-muted" />
            <p className="text-[13px] text-text-muted">No scans match this filter.</p>
          </div>
        ) : (
          <div className="divide-y divide-background-border">
            {/* Column headers */}
            <div className="hidden md:grid grid-cols-[auto_1fr_80px_80px_90px] gap-3 items-center px-4 lg:px-6 py-2
                            text-[11px] font-medium text-text-muted uppercase tracking-wider">
              <div className="w-40">Type</div>
              <div>Input</div>
              <div className="text-right">Score</div>
              <div>Risk</div>
              <div className="text-right">Time</div>
            </div>

            {/* Scan rows */}
            {scans.map((scan, i) => (
              <div
                key={scan.id}
                onClick={() => setSelectedScanId(scan.id)}
                className="scan-row grid grid-cols-1 md:grid-cols-[auto_1fr_80px_80px_90px] gap-2 md:gap-3 items-center
                           px-4 lg:px-6 py-3 group animate-fade-up"
                style={{ animationDelay: `${i * 0.03}s` }}
              >
                {/* Type */}
                <div className="flex items-center gap-2.5 w-40">
                  <span
                    className="w-[7px] h-[7px] rounded-full shrink-0"
                    style={{ background: riskColors[scan.risk_level?.toLowerCase()] || riskColors.safe }}
                  />
                  <span className="text-[12px] font-medium text-text-primary">
                    {SCAN_TYPE_LABELS[scan.scan_type] ?? scan.scan_type}
                  </span>
                  <span className="text-[10px] font-mono text-text-muted">#{scan.id}</span>
                </div>

                {/* Input preview */}
                <div className="text-[12px] text-text-secondary truncate">
                  {truncate(scan.input_text ?? scan.input_url ?? '', 80)}
                </div>

                {/* Score */}
                <div className="text-right">
                  <span
                    className="text-[12px] font-mono font-semibold"
                    style={{ color: riskColors[scan.risk_level?.toLowerCase()] || riskColors.safe }}
                  >
                    {formatScore(scan.risk_score)}
                  </span>
                </div>

                {/* Risk badge */}
                <div>
                  <Badge variant={scan.risk_level?.toLowerCase()} dot className="text-[9px]">
                    {scan.risk_level}
                  </Badge>
                </div>

                {/* Timestamp */}
                <div className="text-[11px] text-text-muted text-right">
                  {formatDate(scan.created_at)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Detail Panel ── */}
      {selectedScanId && (
        <ScanDetailPanel
          scanId={selectedScanId}
          onClose={() => setSelectedScanId(null)}
        />
      )}
    </div>
  );
}
