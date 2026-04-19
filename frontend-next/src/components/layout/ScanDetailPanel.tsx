"use client";

import React from 'react';
import { X, ShieldAlert, ShieldCheck, AlertTriangle, Fingerprint, ExternalLink, Download } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate, formatScore, formatConfidence, getRiskConfig } from '@/lib/formatters';
import { SCAN_TYPE_LABELS, ATTACK_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface ScanDetailPanelProps {
  scan: any;
  onClose: () => void;
}

export default function ScanDetailPanel({ scan, onClose }: ScanDetailPanelProps) {
  if (!scan) return null;

  const result = scan.report || {};
  const cfg = getRiskConfig(result.risk_level || 'safe');

  return (
    <div className="flex flex-col h-full bg-panel animate-fade-in">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-6 border-b border-border bg-bg/40 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className={cn("w-2 h-2 rounded-full", cfg.color.replace('text-', 'bg-'))} />
          <h2 className="text-[13px] font-bold text-text-primary tracking-tight">
            Scan Analysis
          </h2>
          <span className="text-[11px] font-mono text-text-muted/50">#{scan.id}</span>
        </div>
        <button 
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-hover text-text-muted hover:text-text-primary transition-all"
        >
          <X size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-10 scrollbar-hidden">
        
        {/* Risk Score Summary */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Risk Summary</h3>
            <Badge variant={result.risk_level.toLowerCase() as any} className="px-1.5 py-0.5 text-[9px]">
              {result.risk_level}
            </Badge>
          </div>
          <div className={cn("p-6 rounded-2xl border flex items-center justify-between glass", cfg.border)}>
            <div className="space-y-1">
              <p className={cn("text-4xl font-bold tracking-tighter", cfg.color)}>
                {formatScore(result.risk_score)}
              </p>
              <p className="text-[11px] font-medium text-text-secondary">Risk Score • {formatConfidence(result.confidence)} Confidence</p>
            </div>
            {result.risk_level.toLowerCase() === 'safe' ? (
              <ShieldCheck size={44} className="text-risk-safe/20" />
            ) : (
              <ShieldAlert size={44} className="text-risk-critical/20" />
            )}
          </div>
        </div>

        {/* Payload Section */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Analyzed Payload</h3>
          <div className="p-4 rounded-xl bg-bg border border-border/50 text-[13px] text-text-secondary leading-relaxed italic relative group">
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Badge variant="outline" className="text-[9px]">RAW</Badge>
            </div>
            "{scan.input_text}"
          </div>
        </div>

        {/* Analysis Details (Signals & Attack Vectors) */}
        <div className="space-y-6">
          {result.signals_triggered?.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Neural Signals</h3>
              <div className="flex flex-wrap gap-2">
                {result.signals_triggered.map((sig: string, i: number) => (
                  <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-bg border border-border text-[11px] text-text-primary font-medium">
                    <AlertTriangle size={12} className="text-risk-medium" />
                    {sig}
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.attack_classification?.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Classified Vectors</h3>
              <div className="space-y-2">
                {result.attack_classification.map((a: any, i: number) => {
                  const color = ATTACK_COLORS[a.attack_type.toLowerCase()] || 'var(--accent)';
                  return (
                    <div key={i} className="p-4 rounded-xl border border-border/50 bg-bg/40 space-y-2 border-l-4 transition-all hover:bg-bg/60" style={{ borderLeftColor: color }}>
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-bold text-text-primary">{a.attack_type}</span>
                        <span className="text-[10px] font-mono font-bold" style={{ color }}>{formatConfidence(a.confidence)}</span>
                      </div>
                      <p className="text-[12px] text-text-secondary leading-normal">{a.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Recommendation */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Actionable Intel</h3>
          <div className="flex gap-4 items-start p-5 rounded-2xl bg-accent/5 border border-accent/10">
            <Fingerprint size={20} className="text-accent shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-[12px] font-bold text-text-primary uppercase tracking-wider">Protocol Recommendation</p>
              <p className="text-[13px] text-text-secondary leading-relaxed">{result.recommendation}</p>
            </div>
          </div>
        </div>

      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-border bg-bg/40 backdrop-blur-md flex items-center gap-3">
        <Button variant="secondary" size="sm" className="flex-1 h-9 text-[12px] font-bold border-border hover:bg-hover">
          <Download size={14} className="mr-2" />
          Export
        </Button>
        <Link href={`/app/results/${scan.id}`} className="flex-1">
          <Button variant="primary" size="sm" className="w-full h-9 text-[12px] font-bold bg-accent text-white hover:bg-accent-hover shadow-lg shadow-accent/10">
            Full Analysis
            <ExternalLink size={14} className="ml-2 opacity-50" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

