"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ShieldAlert, 
  ShieldCheck, 
  ChevronLeft,
  AlertTriangle, 
  CheckCircle2, 
  Loader2, 
  ExternalLink,
  Search,
  HelpCircle
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import client from '@/store/authStore';
import { getRiskConfig, formatScore, formatConfidence } from '@/lib/formatters';
import { ATTACK_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';

import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

function RiskMeter({ score, level }: { score: number, level: string }) {
  const cfg = getRiskConfig(level);
  const safeScore = typeof score === 'number' && !Number.isNaN(score) ? score : 0;
  const angle = (safeScore / 100) * 180;
  const r = 44, cx = 60, cy = 60;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const arcX = cx + r * Math.cos(toRad(180 - angle));
  const arcY = cy - r * Math.sin(toRad(180 - angle));

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="120" height="70" viewBox="0 0 120 70">
        <path d={`M ${cx - r},${cy} A ${r},${r} 0 0,1 ${cx + r},${cy}`}
              fill="none" stroke="var(--border)" strokeWidth="8" strokeLinecap="round" />
        {safeScore > 0 && (
          <path d={`M ${cx - r},${cy} A ${r},${r} 0 0,1 ${arcX},${arcY}`}
                fill="none" stroke={cfg.color} strokeWidth="8" strokeLinecap="round" />
        )}
        <circle cx={arcX} cy={arcY} r="4" fill={cfg.color} />
        <text x={cx} y={cy - 6} textAnchor="middle" fill={cfg.color}
              fontSize="20" fontWeight="700" className="font-mono">
          {formatScore(safeScore)}
        </text>
        <text x={cx} y={cy + 8} textAnchor="middle" fill="var(--text-muted)"
              fontSize="9" className="uppercase font-semibold tracking-wider">RISK SCORE</text>
      </svg>
      <Badge variant={level.toLowerCase() as any} dot>{level}</Badge>
    </div>
  );
}

function Section({ title, children, accent }: { title: string, children: React.ReactNode, accent?: string }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border"
           style={{ borderLeftColor: accent, borderLeftWidth: 2 }}>
        <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-widest">{title}</p>
      </div>
      <CardContent className="pt-4">{children}</CardContent>
    </Card>
  );
}

export default function ResultsPage() {
  const params = useParams();
  const id = params.id;
  const router = useRouter();

  const [scan, setScan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    client.get(`/api/v1/history/${id}`)
      .then(({ data }) => setScan(data))
      .catch(() => setError('Could not load scan result.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={24} className="animate-spin text-accent" />
    </div>
  );

  if (error || !scan) return (
    <Card className="p-6 text-center space-y-3">
      <p className="text-risk-critical text-[13px]">{error || 'Scan not found'}</p>
      <Button variant="ghost" onClick={() => router.back()}>← Back</Button>
    </Card>
  );

  const result = scan?.report || {};
  const {
    risk_score = 0,
    risk_level = 'safe',
    confidence = 0,
    signals_triggered = [],
    recommendation = 'Analysis pending or not available.',
    attack_classification = [],
  } = result;

  const cfg = getRiskConfig(risk_level);

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-fade-in">
      <div className="flex items-center gap-2">
        <button onClick={() => router.back()}
                className="flex items-center gap-1.5 text-[11px] font-medium text-text-secondary hover:text-text-primary transition-colors">
          <ChevronLeft size={14} /> Back
        </button>
        <span className="text-border">/</span>
        <span className="text-[11px] text-text-muted font-mono">Scan #{id}</span>
      </div>

      <Card className={cn("p-4 border", cfg.bg, cfg.border)}>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <RiskMeter score={risk_score} level={risk_level} />
          <div className="flex-1 space-y-1.5 text-center sm:text-left">
            <h2 className="text-[15px] font-bold text-text-primary tracking-tight">Analysis Complete</h2>
            <div className="flex flex-wrap gap-3 justify-center sm:justify-start text-[11px] text-text-secondary">
              <span>Confidence: <strong className="text-text-primary">{formatConfidence(confidence)}</strong></span>
              <span>Signals: <strong className="text-text-primary">{signals_triggered.length}</strong></span>
            </div>
          </div>
        </div>
      </Card>

      <Section title="Recommendation" accent={cfg.color}>
        <div className="flex items-start gap-2.5">
          {['safe', 'low'].includes(risk_level.toLowerCase())
            ? <CheckCircle2 size={16} className="text-risk-safe mt-0.5 shrink-0" />
            : <ShieldAlert size={16} className="shrink-0 mt-0.5 text-risk-critical" />
          }
          <p className="text-[13px] text-text-secondary leading-relaxed">{recommendation}</p>
        </div>
      </Section>

      {signals_triggered.length > 0 && (
        <Section title={`Triggered Signals (${signals_triggered.length})`} accent="var(--risk-medium)">
          <div className="flex flex-wrap gap-2">
            {signals_triggered.map((sig: string, i: number) => (
              <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-panel border border-border text-[11px] text-text-secondary">
                <AlertTriangle size={11} className="text-risk-medium shrink-0" />
                {sig}
              </span>
            ))}
          </div>
        </Section>
      )}

      <Section title="Input Analysis" accent="var(--text-muted)">
        <div className="max-h-64 overflow-y-auto rounded-md bg-bg border border-border p-3 text-[12px] text-text-secondary leading-relaxed whitespace-pre-wrap break-words">
          {scan.input_text}
        </div>
      </Section>

      {attack_classification.length > 0 && (
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-border"
               style={{ borderLeftColor: 'var(--risk-critical)', borderLeftWidth: 2 }}>
            <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-widest">Attack Classification</p>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {attack_classification.map((a: any, i: number) => {
              const color = ATTACK_COLORS[a.attack_type.toLowerCase()] || 'var(--accent)';
              return (
                <Card key={i} className="p-3 space-y-3 border-l-2" style={{ borderLeftColor: color }}>
                  <div className="flex items-center gap-2.5">
                    <p className="text-[13px] font-semibold text-text-primary flex-1 truncate">{a.attack_type}</p>
                    <span className="text-[11px] font-mono font-semibold shrink-0" style={{ color }}>
                      {formatConfidence(a.confidence)}
                    </span>
                  </div>
                  <p className="text-[11px] text-text-secondary leading-relaxed">{a.description}</p>
                </Card>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
