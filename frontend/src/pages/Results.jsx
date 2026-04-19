// frontend/src/pages/Results.jsx
// Sentinel — Scan results page (flat, minimal sections)
import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ShieldAlert, ShieldCheck, ChevronLeft, AlertTriangle, CheckCircle2, Loader2, ExternalLink, Search } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import client from '@/api/client';
import { getRiskConfig, formatScore, formatConfidence, formatDate } from '@/utils/formatters';
import { ATTACK_ICONS, ATTACK_COLORS } from '@/utils/constants';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

function RiskMeter({ score, level }) {
  const cfg = getRiskConfig(level);
  const safeScore = typeof score === 'number' && !Number.isNaN(score) ? score : 0;
  const angle = (safeScore / 100) * 180;
  const r = 44, cx = 60, cy = 60;
  const toRad = (d) => (d * Math.PI) / 180;
  const arcX = cx + r * Math.cos(toRad(180 - angle));
  const arcY = cy - r * Math.sin(toRad(180 - angle));
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="120" height="70" viewBox="0 0 120 70">
        <path d={`M ${cx - r},${cy} A ${r},${r} 0 0,1 ${cx + r},${cy}`} fill="none" stroke="var(--border)" strokeWidth="8" strokeLinecap="round" />
        {safeScore > 0 && <path d={`M ${cx - r},${cy} A ${r},${r} 0 0,1 ${arcX},${arcY}`} fill="none" stroke={cfg.color} strokeWidth="8" strokeLinecap="round" />}
        <circle cx={arcX} cy={arcY} r="4" fill={cfg.color} />
        <text x={cx} y={cy - 6} textAnchor="middle" fill={cfg.color} fontSize="20" fontWeight="700" className="font-mono">{formatScore(safeScore)}</text>
        <text x={cx} y={cy + 8} textAnchor="middle" fill="var(--text-muted)" fontSize="9" className="uppercase font-semibold tracking-wider">RISK SCORE</text>
      </svg>
      <Badge variant={level.toLowerCase()} dot>{level}</Badge>
    </div>
  );
}

function SignalBadge({ signal }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-background-surface border border-background-border text-[11px] text-text-secondary">
      <AlertTriangle size={11} className="text-risk-medium shrink-0" />{signal}
    </span>
  );
}

function HighlightedText({ text, spans }) {
  if (!text) return null;
  if (!spans?.length) return <p className="text-[12px] text-text-secondary leading-relaxed whitespace-pre-wrap break-words">{text}</p>;
  const sorted = [...spans].sort((a, b) => a.start - b.start);
  const parts = []; let cursor = 0;
  for (const span of sorted) {
    if (span.start < cursor) continue;
    if (span.start > cursor) parts.push({ text: text.slice(cursor, span.start), hi: false });
    parts.push({ text: span.text || text.slice(span.start, span.end), hi: true, reason: span.reason });
    cursor = span.end;
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor), hi: false });
  return (
    <p className="text-[12px] text-text-secondary leading-relaxed whitespace-pre-wrap break-words">
      {parts.map((p, i) => p.hi ? <mark key={i} title={p.reason} className="rounded-sm px-1 cursor-help bg-risk-medium/20 text-risk-medium border-b border-risk-medium/50">{p.text}</mark> : <span key={i}>{p.text}</span>)}
    </p>
  );
}

function AttackCard({ classification }) {
  const { attack_type, confidence, description } = classification;
  const iconName = ATTACK_ICONS[attack_type] ?? 'HelpCircle';
  const color = ATTACK_COLORS[attack_type] ?? 'var(--text-muted)';
  const Icon = LucideIcons[iconName] ?? LucideIcons.HelpCircle;
  const safeConf = typeof confidence === 'number' && !Number.isNaN(confidence) ? confidence : 0;
  return (
    <div className="p-3 space-y-2.5 rounded-lg border border-background-border border-l-2" style={{ borderLeftColor: color }}>
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center w-7 h-7 rounded-md shrink-0" style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
          <Icon size={14} style={{ color }} />
        </div>
        <p className="text-[13px] font-semibold text-text-primary flex-1 truncate">{attack_type}</p>
        <span className="text-[11px] font-mono font-semibold shrink-0" style={{ color }}>{formatConfidence(safeConf)}</span>
      </div>
      <div className="h-1 rounded-full bg-background-hover overflow-hidden">
        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(safeConf, 100)}%`, background: color }} />
      </div>
      <p className="text-[11px] text-text-secondary leading-relaxed">{description}</p>
    </div>
  );
}

function Section({ title, children, accent }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 pl-2" style={{ borderLeft: `2px solid ${accent || 'var(--border)'}` }}>
        <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-widest">{title}</p>
      </div>
      <div>{children}</div>
    </div>
  );
}

export default function Results() {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState(state?.result ?? null);
  const [scan, setScan] = useState(null);
  const [loading, setLoading] = useState(!state?.result);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (state?.result) return;
    setLoading(true);
    client.get(`/api/v1/history/${id}`)
      .then(({ data }) => { setScan(data); setResult(data.report); })
      .catch(() => setError('Could not load scan result.'))
      .finally(() => setLoading(false));
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 size={24} className="animate-spin text-accent" /></div>;
  if (error) return <div className="max-w-3xl mx-auto px-4 py-10 text-center space-y-3"><p className="text-risk-critical text-[13px]">{error}</p><Button variant="ghost" onClick={() => navigate(-1)}>← Back</Button></div>;
  if (!result) return null;

  const { risk_score = 0, risk_level = 'safe', confidence = 0, signals_triggered = [], highlighted_spans = [], recommendation = '', attack_classification = [], module_scores } = result;
  const cfg = getRiskConfig(risk_level);
  const topAttacks = attack_classification.filter((a) => a.attack_type !== 'Unknown / Other');
  const fallback = attack_classification.find((a) => a.attack_type === 'Unknown / Other');
  const displayAttacks = topAttacks.length ? topAttacks : (fallback ? [fallback] : []);
  const inputText = scan?.input_text ?? state?.inputText ?? '';

  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-6 py-6 space-y-6 animate-in">
      <div className="flex items-center gap-2">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-[11px] font-medium text-text-secondary hover:text-text-primary transition-colors">
          <ChevronLeft size={14} /> Back
        </button>
        <span className="text-background-border">/</span>
        <span className="text-[11px] text-text-muted font-mono">Scan #{id}</span>
      </div>

      {/* Risk overview */}
      <div className={`p-5 rounded-lg ${cfg.bg} border ${cfg.border}`}>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <RiskMeter score={risk_score} level={risk_level} />
          <div className="flex-1 space-y-1.5 text-center sm:text-left">
            <h2 className="text-[15px] font-bold text-text-primary tracking-tight">Analysis Complete</h2>
            <div className="flex flex-wrap gap-3 justify-center sm:justify-start text-[11px] text-text-secondary">
              <span>Confidence: <strong className="text-text-primary">{formatConfidence(confidence)}</strong></span>
              <span>Signals: <strong className="text-text-primary">{signals_triggered.length}</strong></span>
              <span>Attack types: <strong className="text-text-primary">{topAttacks.length || 1}</strong></span>
            </div>
            {module_scores && Object.keys(module_scores).length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-1">
                {Object.entries(module_scores).map(([mod, s]) => (
                  <span key={mod} className="px-2 py-0.5 rounded bg-background-surface border border-background-border text-[10px] font-mono text-text-muted">
                    {mod.replace(/_/g, ' ')}: {formatScore(s)}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {recommendation && (
        <Section title="Recommendation" accent={cfg.color}>
          <div className="flex items-start gap-2.5">
            {['safe', 'low'].includes(risk_level) ? <CheckCircle2 size={16} className="text-risk-safe mt-0.5 shrink-0" /> : <ShieldAlert size={16} className="shrink-0 mt-0.5" style={{ color: cfg.color }} />}
            <p className="text-[13px] text-text-secondary leading-relaxed">{recommendation}</p>
          </div>
        </Section>
      )}

      {result.official_verification_url && (
        <Section title="Official Source Verification" accent="var(--accent)">
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-lg bg-background-surface border border-background-border">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent-muted border border-accent/20 shrink-0"><Search size={18} className="text-accent" /></div>
            <div className="flex-1 text-center sm:text-left space-y-1">
              <p className="text-[13px] font-bold text-text-primary tracking-tight">Verify via Career Portal</p>
              <p className="text-[11px] text-text-secondary">We've generated a search query to help you find this exact listing on the employer's official site.</p>
            </div>
            <a href={result.official_verification_url} target="_blank" rel="noopener noreferrer" className="shrink-0">
              <Button variant="primary" className="h-8 px-3 text-[11px]">Verify Official Site <ExternalLink size={12} /></Button>
            </a>
          </div>
        </Section>
      )}

      {signals_triggered.length > 0 && (
        <Section title={`Triggered Signals (${signals_triggered.length})`} accent="var(--risk-medium)">
          <div className="flex flex-wrap gap-2">{signals_triggered.map((sig, i) => <SignalBadge key={i} signal={sig} />)}</div>
        </Section>
      )}

      {inputText && (
        <Section title={`Input${highlighted_spans.length ? ` — ${highlighted_spans.length} span(s) flagged` : ''}`} accent="var(--text-muted)">
          <div className="max-h-64 overflow-y-auto rounded-md bg-background-surface border border-background-border p-3">
            <HighlightedText text={inputText} spans={highlighted_spans} />
          </div>
          {highlighted_spans.length > 0 && <p className="text-[10px] text-text-muted mt-2">Hover highlighted text to see the flag reason.</p>}
        </Section>
      )}

      <Section title="Attack Classification" accent="var(--risk-critical)">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {displayAttacks.map((a, i) => <AttackCard key={i} classification={a} />)}
        </div>
      </Section>
    </div>
  );
}
