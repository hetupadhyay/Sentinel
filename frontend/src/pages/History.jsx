// frontend/src/pages/History.jsx
import { useEffect, useState, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ScanSearch, X, ChevronLeft, ChevronRight, Loader2, Search } from 'lucide-react';
import client from '@/api/client';
import { formatDate, truncate, formatScore } from '@/utils/formatters';
import { SCAN_TYPE_LABELS } from '@/utils/constants';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import ScanDetailPanel from '@/components/ScanDetailPanel';

const RISK_LEVELS = ['safe', 'low', 'medium', 'high', 'critical'];
const SCAN_TYPES = ['job_posting', 'message', 'news', 'url', 'impersonation'];
const PAGE_SIZE = 20;
const riskColors = { critical: 'var(--risk-critical)', high: 'var(--risk-high)', medium: 'var(--risk-medium)', low: 'var(--risk-low)', safe: 'var(--risk-safe)' };

function FilterPill({ label, active, onClick }) {
  return (
    <button onClick={onClick}
      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors border ${active ? 'bg-accent-muted text-accent border-accent/20' : 'text-text-muted bg-transparent border-transparent hover:text-text-secondary hover:bg-background-hover'}`}>
      {label}
    </button>
  );
}

export default function History() {
  const location = useLocation();
  const navigate = useNavigate();
  const [scans, setScans] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedScanId, setSelectedScanId] = useState(null);
  const [riskFilter, setRiskFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { setSearchQuery(new URLSearchParams(location.search).get('search') || ''); }, [location.search]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasFilters = riskFilter || typeFilter || searchQuery;

  const fetchHistory = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams({ page, page_size: PAGE_SIZE });
      if (riskFilter) params.set('risk_level', riskFilter);
      if (typeFilter) params.set('scan_type', typeFilter);
      if (searchQuery) params.set('query', searchQuery);
      const { data } = await client.get(`/api/v1/history?${params}`);
      setScans(data.items ?? []); setTotal(data.total ?? 0);
    } catch { setError('Failed to load scan history.'); }
    finally { setLoading(false); }
  }, [page, riskFilter, typeFilter, searchQuery]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);
  useEffect(() => { setPage(1); }, [riskFilter, typeFilter, searchQuery]);

  const clearFilters = () => { setRiskFilter(''); setTypeFilter(''); if (searchQuery) navigate('/app/history', { replace: true }); };

  return (
    <div className="animate-in">
      <div className="border-b border-background-border bg-background sticky top-12 z-30">
        <div className="max-w-[1200px] mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <h1 className="text-[14px] font-semibold text-text-primary tracking-tight">History</h1>
              {!loading && <span className="text-[11px] text-text-muted font-mono">{total} result{total !== 1 ? 's' : ''}</span>}
            </div>
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input type="text" placeholder="Search scans…" value={searchQuery}
                onChange={(e) => { e.target.value ? navigate(`/app/history?search=${encodeURIComponent(e.target.value)}`, { replace: true }) : navigate('/app/history', { replace: true }); }}
                className="w-48 pl-8 pr-3 h-[30px] text-[12px] text-text-primary bg-background-hover border border-background-border rounded-md placeholder:text-text-muted focus:border-accent focus:ring-0 focus:outline-none transition-colors" />
            </div>
          </div>
          <div className="flex items-center gap-4 pb-2.5 overflow-x-auto scrollbar-hidden">
            <div className="flex items-center gap-0.5">
              <span className="text-[10px] text-text-muted uppercase tracking-wider mr-1.5 shrink-0">Risk</span>
              {RISK_LEVELS.map((lvl) => (<FilterPill key={lvl} label={lvl} active={riskFilter === lvl} onClick={() => setRiskFilter(riskFilter === lvl ? '' : lvl)} />))}
            </div>
            <div className="w-px h-4 bg-background-border shrink-0" />
            <div className="flex items-center gap-0.5">
              <span className="text-[10px] text-text-muted uppercase tracking-wider mr-1.5 shrink-0">Type</span>
              {SCAN_TYPES.map((t) => (<FilterPill key={t} label={SCAN_TYPE_LABELS[t]} active={typeFilter === t} onClick={() => setTypeFilter(typeFilter === t ? '' : t)} />))}
            </div>
            {hasFilters && (<><div className="w-px h-4 bg-background-border shrink-0" /><button onClick={clearFilters} className="flex items-center gap-1 text-[11px] text-text-muted hover:text-risk-critical transition-colors shrink-0"><X size={11} /> Clear</button></>)}
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 size={20} className="animate-spin text-accent" /></div>
        ) : error ? (
          <div className="flex items-center justify-center py-16"><p className="text-[13px] text-risk-critical">{error}</p></div>
        ) : !scans.length ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <ScanSearch size={24} className="text-text-muted" />
            <p className="text-[13px] text-text-muted">{hasFilters ? 'No scans match filters.' : 'No scans yet.'}</p>
            {!hasFilters && <Link to="/app/analyze"><Button variant="primary">Run first analysis</Button></Link>}
          </div>
        ) : (
          <>
            <div className="hidden md:grid grid-cols-[auto_1fr_80px_80px_90px] gap-3 items-center px-4 lg:px-6 py-2 text-[11px] font-medium text-text-muted uppercase tracking-wider border-b border-background-border">
              <div className="w-40">Type</div><div>Input</div><div className="text-right">Score</div><div>Risk</div><div className="text-right">Time</div>
            </div>
            <div className="divide-y divide-background-border">
              {scans.map((scan, i) => (
                <div key={scan.id} onClick={() => setSelectedScanId(scan.id)} className="scan-row grid grid-cols-1 md:grid-cols-[auto_1fr_80px_80px_90px] gap-2 md:gap-3 items-center px-4 lg:px-6 py-3 animate-fade-up" style={{ animationDelay: `${i * 0.03}s` }}>
                  <div className="flex items-center gap-2.5 w-40">
                    <span className="w-[7px] h-[7px] rounded-full shrink-0" style={{ background: riskColors[scan.risk_level?.toLowerCase()] || riskColors.safe }} />
                    <span className="text-[12px] font-medium text-text-primary">{SCAN_TYPE_LABELS[scan.scan_type] ?? scan.scan_type}</span>
                    <span className="text-[10px] font-mono text-text-muted">#{scan.id}</span>
                  </div>
                  <div className="text-[12px] text-text-secondary truncate">{truncate(scan.input_text ?? scan.input_url ?? '', 80)}</div>
                  <div className="text-right"><span className="text-[12px] font-mono font-semibold" style={{ color: riskColors[scan.risk_level?.toLowerCase()] || riskColors.safe }}>{formatScore(scan.risk_score)}</span></div>
                  <div><Badge variant={scan.risk_level?.toLowerCase()} dot className="text-[9px]">{scan.risk_level}</Badge></div>
                  <div className="text-[11px] text-text-muted text-right">{formatDate(scan.created_at)}</div>
                </div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 lg:px-6 py-3 border-t border-background-border">
                <Button variant="ghost" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="h-8 px-2 text-[12px]"><ChevronLeft size={13} /> Prev</Button>
                <span className="text-[11px] text-text-muted font-mono">{page} / {totalPages}</span>
                <Button variant="ghost" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="h-8 px-2 text-[12px]">Next <ChevronRight size={13} /></Button>
              </div>
            )}
          </>
        )}
      </div>
      {selectedScanId && <ScanDetailPanel scanId={selectedScanId} onClose={() => setSelectedScanId(null)} />}
    </div>
  );
}
