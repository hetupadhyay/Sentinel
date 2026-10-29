"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// Example inputs and the result Sentinel produces for each. Signal names match
// the labels the backend detectors emit.

type Part = string | { text: string; note: number };

type Sample = {
  id: string;
  tab: string;
  source: string;
  from: string;
  body: Part[];
  notes: { signal: string; why: string }[];
  score: number;
  level: 'critical' | 'high' | 'low';
  levelLabel: string;
  advice: string;
};

const samples: Sample[] = [
  {
    id: 'job',
    tab: 'Job offer',
    source: 'Email',
    from: 'HR Desk <amaz0n.careers.hr@gmail.com>',
    body: [
      'Hi! We are ',
      { text: 'urgently', note: 0 },
      ' hiring Data Entry Associates for ',
      { text: 'Amaz0n', note: 1 },
      '. Work from home and earn ',
      { text: '$500 per day', note: 2 },
      '. ',
      { text: 'No interview required', note: 3 },
      '. To confirm your seat, pay the ',
      { text: 'registration fee', note: 4 },
      ' of $49 today, then message us on ',
      { text: 'WhatsApp to receive your job', note: 5 },
      ' letter.',
    ],
    notes: [
      { signal: 'Urgency pressure language', why: 'Pushes you to decide before you check.' },
      { signal: "Possible impersonation: 'Amaz0n' resembles 'Amazon'", why: 'A zero stands in for the letter o.' },
      { signal: 'Implausible hourly/daily rate', why: 'Entry-level data entry doesn’t pay this.' },
      { signal: 'No interview required', why: 'Real employers talk to you before hiring.' },
      { signal: 'Registration fee request', why: 'Employers pay you. They never charge you to start.' },
      { signal: 'WhatsApp job recruitment', why: 'Hiring moves to a personal chat app.' },
    ],
    score: 91,
    level: 'critical',
    levelLabel: 'Critical risk',
    advice: 'Don’t pay the fee or send documents. Block the sender and report the address.',
  },
  {
    id: 'sms',
    tab: 'Bank text',
    source: 'Text message',
    from: '+44 7700 900123',
    body: [
      'NorthBank: ',
      { text: 'Your account has been suspended', note: 0 },
      ' after unusual sign-in activity. ',
      { text: 'Act within 24 hours', note: 1 },
      ' to avoid closure. ',
      { text: 'Click here to verify', note: 2 },
      ' at ',
      { text: 'https://northbank-secure.xyz/login', note: 3 },
      ' and ',
      { text: 'enter your OTP', note: 4 },
      ' when asked.',
    ],
    notes: [
      { signal: 'Account suspension threat', why: 'Banks don’t lock accounts over text.' },
      { signal: 'Immediate action demand', why: 'A deadline to stop you calling the bank first.' },
      { signal: 'Phishing click-through instruction', why: 'Sends you to a page it controls.' },
      { signal: 'Suspicious TLD in URL: .xyz', why: 'Not your bank’s real address.' },
      { signal: 'Credential input request', why: 'Your one-time code lets them into your account.' },
    ],
    score: 84,
    level: 'high',
    levelLabel: 'High risk',
    advice: 'Don’t open the link. Call the number on the back of your card to check your account.',
  },
  {
    id: 'recruiter',
    tab: 'Recruiter email',
    source: 'Email',
    from: 'Priya Nair <priya.nair@ledgerly.io>',
    body: [
      'Hi Sam, thanks for applying to the Support Engineer role. I’d like to set up a 30-minute video call with the hiring manager next week. You can pick a time on our careers site. There’s nothing to pay and nothing to prepare beyond your CV.',
    ],
    notes: [
      { signal: 'Sender’s domain matches the company', why: '' },
      { signal: 'Normal interview process', why: '' },
      { signal: 'No payment or personal data request', why: '' },
    ],
    score: 12,
    level: 'low',
    levelLabel: 'Low risk',
    advice: 'Nothing here looks like fraud. Book the call through the company’s own careers site.',
  },
];

const levelColor = {
  critical: 'text-risk-critical',
  high: 'text-risk-high',
  low: 'text-risk-safe',
} as const;

const levelBar = {
  critical: 'bg-risk-critical',
  high: 'bg-risk-high',
  low: 'bg-risk-safe',
} as const;

// Delay between each highlighter stroke, in ms.
const STROKE_GAP = 220;

export function Specimen() {
  const [index, setIndex] = useState(0);
  const [inked, setInked] = useState(false);
  const [active, setActive] = useState<number | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const sample = samples[index];
  const flagged = sample.body.filter((p) => typeof p !== 'string').length;

  // Restart the highlighter sweep whenever the sample changes.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setInked(true));
    });
    return () => cancelAnimationFrame(frame);
  }, [index]);

  const show = (i: number) => {
    if (i === index) return;
    setInked(false);
    setActive(null);
    setIndex(i);
  };

  const select = (i: number) => {
    const next = (i + samples.length) % samples.length;
    show(next);
    tabRefs.current[next]?.focus();
  };

  const onTabKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') select(index + 1);
    if (e.key === 'ArrowLeft') select(index - 1);
  };

  const verdictDelay = flagged * STROKE_GAP + 250;

  return (
    <figure className="specimen relative">
      <div
        role="tablist"
        aria-label="Example messages"
        className="flex gap-1 mb-3"
        onKeyDown={onTabKey}
      >
        {samples.map((s, i) => (
          <button
            key={s.id}
            ref={(el) => { tabRefs.current[i] = el; }}
            role="tab"
            id={`tab-${s.id}`}
            aria-selected={i === index}
            aria-controls={`panel-${s.id}`}
            tabIndex={i === index ? 0 : -1}
            onClick={() => show(i)}
            className={cn(
              'h-9 px-3.5 rounded-full text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
              i === index
                ? 'bg-text-primary text-bg'
                : 'text-text-secondary hover:text-text-primary hover:bg-hover'
            )}
          >
            {s.tab}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`panel-${sample.id}`}
        aria-labelledby={`tab-${sample.id}`}
        className="rounded-[14px] bg-panel border border-border shadow-[0_1px_0_rgba(19,32,58,0.04),0_12px_32px_-12px_rgba(19,32,58,0.18)]"
      >
        {/* The message being examined */}
        <div className="px-6 pt-5 pb-6 sm:px-8 sm:pt-6 sm:pb-7">
          <p className="text-[12px] text-text-muted">
            {sample.source} from <span className="text-text-secondary">{sample.from}</span>
          </p>
          <p
            key={sample.id}
            className="mt-4 font-serif text-[17px] sm:text-[19px] leading-[1.7] text-text-primary"
          >
            {sample.body.map((part, i) => {
              if (typeof part === 'string') return <React.Fragment key={i}>{part}</React.Fragment>;
              const order = sample.body.slice(0, i).filter((p) => typeof p !== 'string').length;
              return (
                <mark
                  key={i}
                  data-inked={inked}
                  data-active={active === part.note}
                  aria-describedby={`note-${sample.id}-${part.note}`}
                  onMouseEnter={() => setActive(part.note)}
                  onMouseLeave={() => setActive(null)}
                  className="marker"
                  style={{ transitionDelay: inked ? `${order * STROKE_GAP}ms` : '0ms' }}
                >
                  {part.text}
                  <sup className="ml-0.5 font-sans text-[10px] font-semibold tabular-nums text-text-secondary">
                    {part.note + 1}
                  </sup>
                </mark>
              );
            })}
          </p>
        </div>

        {/* Sentinel's reading of it */}
        <div
          className="verdict border-t border-border px-6 py-5 sm:px-8 sm:py-6 grid gap-6 sm:grid-cols-[150px_minmax(0,1fr)]"
          data-inked={inked}
          style={{ transitionDelay: inked ? `${verdictDelay}ms` : '0ms' }}
        >
          <div>
            <p className={cn('text-[13px] font-semibold', levelColor[sample.level])}>
              {sample.levelLabel}
            </p>
            <p className="mt-1 flex items-baseline gap-1 tabular-nums">
              <span className="text-[44px] leading-none font-semibold tracking-tight text-text-primary">
                {sample.score}
              </span>
              <span className="text-[13px] text-text-muted">/ 100</span>
            </p>
            <div className="mt-3 h-1 rounded-full bg-border overflow-hidden" aria-hidden>
              <div
                className={cn('h-full rounded-full', levelBar[sample.level])}
                style={{ width: `${sample.score}%` }}
              />
            </div>
          </div>

          <div className="min-w-0">
            {flagged > 0 ? (
              <ol className="space-y-1.5 text-[13px]">
                {sample.notes.map((n, i) => (
                  <li
                    key={i}
                    id={`note-${sample.id}-${i}`}
                    onMouseEnter={() => setActive(i)}
                    onMouseLeave={() => setActive(null)}
                    className={cn(
                      'grid grid-cols-[18px_minmax(0,1fr)] gap-x-1 rounded-md -mx-1.5 px-1.5 py-0.5 transition-colors',
                      active === i && 'bg-hover'
                    )}
                  >
                    <span className="tabular-nums text-text-muted">{i + 1}</span>
                    <span>
                      <span className="font-medium text-text-primary">{n.signal}.</span>{' '}
                      <span className="text-text-secondary">{n.why}</span>
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <ul className="space-y-1.5 text-[13px]">
                {sample.notes.map((n, i) => (
                  <li key={i} className="flex items-center gap-2 text-text-primary">
                    <Check size={14} className="text-risk-safe shrink-0" aria-hidden />
                    {n.signal}
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-4 text-[14px] leading-snug text-text-primary">{sample.advice}</p>
          </div>
        </div>
      </div>

      <figcaption className="mt-3 text-[12px] text-text-muted">
        Example messages. Each number links a marked phrase to the reason it was flagged.
      </figcaption>
    </figure>
  );
}
