"use client";

import { useEffect, useState } from 'react';
import { 
  Loader2, 
  Search, 
  Filter, 
  LayoutList, 
  ArrowRight,
  MoreVertical,
  ChevronRight,
  ShieldCheck,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import client from '@/store/authStore';
import { formatDate, formatScore } from '@/lib/formatters';
import { SCAN_TYPE_LABELS } from '@/lib/constants';

import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import ScanDetailPanel from '@/components/layout/ScanDetailPanel';

interface Scan {
  id: number;
  scan_type: string;
  input_text: string;
  risk_level: string;
  risk_score: number;
  created_at: string;
  report: any;
}

export default function ScansPage() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedScan, setSelectedScan] = useState<Scan | null>(null);

  useEffect(() => {
    client.get('/api/v1/history')
      .then(({ data }) => setScans(data.items || []))
      .catch(() => setError('Failed to load scans.'))
      .finally(() => setLoading(false));
  }, []);

  const getRiskColor = (level: string) => {
    const l = (level || '').toLowerCase();
    switch (l) {
      case 'critical': return 'text-risk-critical';
      case 'high': return 'text-risk-high';
      case 'medium': return 'text-risk-medium';
      case 'low': return 'text-risk-low';
      case 'safe': return 'text-risk-safe';
      default: return 'text-text-muted';
    }
  };

  const getStatusDot = (level: string) => {
    const l = (level || '').toLowerCase();
    switch (l) {
      case 'critical': return 'bg-risk-critical';
      case 'high': return 'bg-risk-high';
      case 'safe': return 'bg-risk-safe';
      default: return 'bg-risk-medium';
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[80vh] gap-3">
      <Loader2 size={24} className="animate-spin text-accent" />
      <span className="text-[11px] font-bold text-text-muted uppercase tracking-widest animate-pulse">Loading Signals...</span>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-bg animate-in">
      {/* Header Bar */}
      <div className="h-12 border-b border-border flex items-center justify-between px-6 bg-bg/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <h2 className="text-[13px] font-bold text-text-primary tracking-tight">Scans</h2>
          <div className="h-3 w-px bg-border/60" />
          <span className="text-[11px] font-mono text-text-muted">{scans?.length || 0}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="h-7 pl-8 pr-3 bg-hover/50 border border-border/40 rounded-md text-[11px] focus:outline-none focus:border-accent/50 w-48 transition-all"
            />
          </div>
          <Button variant="ghost" size="sm" className="h-7 px-2.5 text-[11px] border border-border/40 bg-panel/30">
            <Filter size={12} className="mr-1.5" />
            Filter
          </Button>
          <Link href="/app/analyze">
            <Button size="sm" className="h-7 px-3 bg-accent text-white text-[11px] font-bold hover:bg-accent-hover transition-all">
              <Plus size={13} className="mr-1" /> New
            </Button>
          </Link>
        </div>
      </div>

      {/* List Content */}
      <div className="flex-1 overflow-y-auto">
        {error ? (
          <div className="p-12 text-center text-risk-critical text-[13px] font-bold">{error}</div>
        ) : !scans || scans.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <div className="w-14 h-14 rounded-2xl bg-panel border border-border flex items-center justify-center text-text-muted animate-fade-up">
              <ShieldCheck size={28} />
            </div>
            <div className="text-center space-y-1 animate-fade-up" style={{ animationDelay: '0.1s' }}>
              <p className="text-[14px] font-bold text-text-primary">No scans yet</p>
              <p className="text-[12px] text-text-muted max-w-[240px]">Analyze your first content to see signals here.</p>
            </div>
            <Link href="/app/analyze" className="animate-fade-up" style={{ animationDelay: '0.2s' }}>
              <Button size="sm" className="h-9 px-6 bg-accent text-white font-bold rounded-lg hover:bg-accent-hover transition-all">
                Run First Scan
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {/* Column Headers */}
            <div className="hidden md:grid grid-cols-[auto_1fr_80px_80px_100px] gap-4 items-center px-6 py-2 text-[10px] font-bold text-text-muted uppercase tracking-widest border-b border-border/20 bg-panel/10">
              <div className="w-40">Type</div>
              <div>Input Preview</div>
              <div className="text-right">Score</div>
              <div>Risk</div>
              <div className="text-right">Time</div>
            </div>

            {scans.map((scan, i) => (
              <div 
                key={scan?.id || i}
                onClick={() => setSelectedScan(selectedScan?.id === scan?.id ? null : scan)}
                className={cn(
                  "grid grid-cols-1 md:grid-cols-[auto_1fr_80px_80px_100px] gap-4 items-center px-6 py-3 cursor-pointer transition-all animate-fade-up group",
                  selectedScan?.id === scan?.id ? "bg-accent/[0.03]" : "hover:bg-hover"
                )}
                style={{ animationDelay: `${i * 0.03}s` }}
              >
                <div className="flex items-center gap-3 w-40 shrink-0">
                  <div className={cn(
                    "w-2 h-2 rounded-full shrink-0 shadow-[0_0_8px_currentColor]",
                    getStatusDot(scan?.risk_level)
                  )} style={{ color: `var(--risk-${(scan?.risk_level || 'medium').toLowerCase()})` }} />
                  <span className="text-[12.5px] font-bold text-text-primary truncate">
                    {SCAN_TYPE_LABELS[scan?.scan_type] || scan?.scan_type || 'Unknown Scan'}
                  </span>
                  <span className="text-[9px] font-mono text-text-muted">#{scan?.id}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-text-secondary truncate italic">
                    "{scan?.input_text || 'No preview available'}"
                  </p>
                </div>

                <div className={cn(
                  "text-[12px] font-mono font-bold text-right",
                  getRiskColor(scan?.risk_level)
                )}>
                  {formatScore(scan?.risk_score || 0)}
                </div>

                <div>
                  <Badge variant={(scan?.risk_level || 'medium').toLowerCase() as any} className="text-[9px] px-1.5 py-0">
                    {scan?.risk_level || 'Unknown'}
                  </Badge>
                </div>

                <div className="text-[11px] text-text-muted text-right font-medium">
                  {formatDate(scan?.created_at || new Date().toISOString())}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Side Detail Panel */}
      {selectedScan && (
        <div className="fixed top-12 bottom-0 right-0 w-[480px] z-50 transition-all transform bg-panel border-l border-border shadow-2xl animate-in">
          <ScanDetailPanel scan={selectedScan} onClose={() => setSelectedScan(null)} />
        </div>
      )}
    </div>
  );
}

