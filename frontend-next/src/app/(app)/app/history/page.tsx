"use client";

import { useEffect, useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  ArrowRight,
  Loader2,
  MoreVertical,
  ExternalLink,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import client from '@/store/authStore';
import { formatDate, formatScore } from '@/lib/formatters';
import { SCAN_TYPE_LABELS } from '@/lib/constants';
import { cn } from '@/lib/utils';

import { Card } from '@/components/ui/Card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface Scan {
  id: number;
  scan_type: string;
  input_text: string;
  risk_level: string;
  risk_score: number;
  created_at: string;
}

export default function HistoryPage() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    client.get('/api/v1/history')
      .then(({ data }) => setScans(data.items || []))
      .catch(() => setError('Failed to load history.'))
      .finally(() => setLoading(false));
  }, []);

  const filteredScans = scans.filter(s => 
    s.input_text.toLowerCase().includes(search.toLowerCase()) ||
    s.scan_type.toLowerCase().includes(search.toLowerCase())
  );

  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'critical': return 'text-risk-critical';
      case 'high': return 'text-risk-high';
      case 'medium': return 'text-risk-medium';
      case 'low': return 'text-risk-low';
      case 'safe': return 'text-risk-safe';
      default: return 'text-text-muted';
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <Loader2 size={24} className="animate-spin text-accent" />
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-bg animate-in">
      {/* Header Bar */}
      <div className="h-12 border-b border-border flex items-center justify-between px-6 bg-bg/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <h2 className="text-[13px] font-bold text-text-primary tracking-tight">History</h2>
          <div className="h-3 w-px bg-border/60" />
          <span className="text-[11px] font-mono text-text-muted">{scans?.length || 0}</span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-7 pl-8 pr-3 bg-hover/50 border border-border/40 rounded-md text-[11px] focus:outline-none focus:border-accent/50 w-48 transition-all"
            />
          </div>
          <Button variant="ghost" size="sm" className="h-7 px-2.5 text-[11px] border border-border/40 bg-panel/30">
            <Filter size={12} className="mr-1.5" />
            Filter
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {error ? (
          <div className="p-12 text-center text-risk-critical text-[13px]">{error}</div>
        ) : !filteredScans || filteredScans.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
            <div className="w-14 h-14 rounded-2xl bg-panel border border-border flex items-center justify-center text-text-muted animate-fade-up">
              <History size={28} />
            </div>
            <div className="text-center space-y-1 animate-fade-up" style={{ animationDelay: '0.1s' }}>
              <p className="text-[14px] font-bold text-text-primary">No history found</p>
              <p className="text-[12px] text-text-muted">Try a different search term or run a scan.</p>
            </div>
          </div>
        ) : (
          <div className="glass rounded-xl border border-border/40 shadow-xl overflow-hidden animate-fade-up">
            <Table>
              <TableHeader className="bg-bg/40 border-b border-border/40">
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="pl-6 text-[10px] font-bold text-text-muted uppercase tracking-widest h-10">Type</TableHead>
                  <TableHead className="text-[10px] font-bold text-text-muted uppercase tracking-widest h-10">Input Preview</TableHead>
                  <TableHead className="text-[10px] font-bold text-text-muted uppercase tracking-widest text-center h-10">Risk</TableHead>
                  <TableHead className="text-[10px] font-bold text-text-muted uppercase tracking-widest text-center h-10">Score</TableHead>
                  <TableHead className="text-[10px] font-bold text-text-muted uppercase tracking-widest text-right pr-6 h-10">Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredScans.map((scan, i) => (
                  <TableRow 
                    key={scan?.id || i} 
                    className="border-border/10 hover:bg-hover group cursor-pointer transition-colors"
                    onClick={() => window.location.href = `/app/results/${scan?.id}`}
                  >
                    <TableCell className="pl-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor]", getRiskColor(scan?.risk_level))} style={{ color: `var(--risk-${(scan?.risk_level || 'medium').toLowerCase()})` }} />
                        <span className="text-[12.5px] font-bold text-text-primary">
                          {SCAN_TYPE_LABELS[scan?.scan_type] || scan?.scan_type || 'Unknown'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate text-[12px] text-text-secondary italic">
                      "{scan?.input_text || 'No preview'}"
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={(scan?.risk_level || 'medium').toLowerCase() as any} className="px-1.5 py-0 text-[9px] uppercase tracking-widest">
                        {scan?.risk_level || 'Unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell className={cn("text-center font-mono text-[12px] font-bold", getRiskColor(scan?.risk_level))}>
                      {formatScore(scan?.risk_score || 0)}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-3">
                        <span className="text-[11px] text-text-muted font-medium">
                          {formatDate(scan?.created_at || new Date().toISOString())}
                        </span>
                        <ChevronRight size={14} className="text-text-muted group-hover:text-accent transition-all group-hover:translate-x-0.5" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

