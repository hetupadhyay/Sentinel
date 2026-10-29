"use client";

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

// A scam text as it would arrive, with the phrases Sentinel flags tinted.
const message: (string | { flag: string })[] = [
  'NorthBank: ',
  { flag: 'Your account has been suspended' },
  '. ',
  { flag: 'Act within 24 hours' },
  ' or it will be closed. Verify at ',
  { flag: 'northbank-secure.xyz' },
  ' and ',
  { flag: 'enter your OTP' },
  '.',
];

const SCORE = 91;
const spring = { type: 'spring', bounce: 0, duration: 0.6 } as const;

function Gauge({ animate }: { animate: boolean }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90 shrink-0" aria-hidden>
      <circle cx="32" cy="32" r={r} fill="none" strokeWidth="6" className="stroke-hover" />
      <motion.circle
        cx="32"
        cy="32"
        r={r}
        fill="none"
        strokeWidth="6"
        strokeLinecap="round"
        className="stroke-risk-critical"
        strokeDasharray={c}
        initial={{ strokeDashoffset: animate ? c : c * (1 - SCORE / 100) }}
        animate={{ strokeDashoffset: c * (1 - SCORE / 100) }}
        transition={{ ...spring, duration: 1, delay: 0.9 }}
      />
    </svg>
  );
}

export function HeroDemo() {
  const reduce = useReducedMotion();
  const animate = !reduce;

  return (
    <div className="relative mx-auto w-full max-w-[680px] text-left">
      <div className="rounded-[32px] bg-panel px-5 pt-8 pb-28 sm:px-10 sm:pt-10 sm:pb-32">
        <p className="text-[13px] text-text-muted">From +44 7700 900123</p>
        <motion.div
          initial={animate ? { opacity: 0, y: 12 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.2 }}
          className="mt-3 max-w-[86%] rounded-[22px] rounded-bl-[6px] bg-bg px-5 py-3.5 text-[17px] sm:text-[19px] leading-[1.45] text-text-primary shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
        >
          {message.map((part, i) =>
            typeof part === 'string' ? (
              <React.Fragment key={i}>{part}</React.Fragment>
            ) : (
              <motion.mark
                key={i}
                initial={animate ? { backgroundColor: 'rgba(0,0,0,0)' } : false}
                animate={{ backgroundColor: 'var(--flag)' }}
                transition={{ duration: 0.35, delay: 0.6 + i * 0.06 }}
                className="rounded-[5px] px-[3px] -mx-[3px] text-inherit box-decoration-clone"
              >
                {part.flag}
              </motion.mark>
            )
          )}
        </motion.div>
      </div>

      {/* Sentinel's verdict, floating over the conversation like a sheet */}
      <motion.div
        initial={animate ? { opacity: 0, y: 24, scale: 0.97 } : false}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ ...spring, delay: 0.8 }}
        className="absolute inset-x-4 -bottom-10 sm:inset-x-10 flex items-center gap-4 rounded-[24px] bg-bg/80 dark:bg-[#2c2c2e]/80 backdrop-blur-xl px-5 py-4 shadow-[0_0_0_0.5px_var(--border),0_20px_50px_-12px_rgba(0,0,0,0.22)]"
      >
        <div className="relative">
          <Gauge animate={animate} />
          <span className="absolute inset-0 grid place-items-center text-[17px] font-semibold tabular-nums">
            {SCORE}
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-[17px] font-semibold text-risk-critical">This is a scam</p>
          <p className="text-[14px] leading-snug text-text-secondary">
            Don’t open the link. Call your bank instead.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
