import React from 'react';
import Link from 'next/link';
import { Specimen } from '@/components/marketing/Specimen';

// What each detector reads, with signals it actually reports.
const checks = [
  {
    title: 'Job offers',
    body: 'Fake recruiters, fees to get started, and pay that’s too good to be true.',
    signals: ['Registration fee request', 'No interview required', 'Personal email used for recruitment'],
  },
  {
    title: 'Texts and emails',
    body: 'Messages that rush you into signing in, paying, or sharing a code.',
    signals: ['Credential input request', 'Account suspension threat', 'OTP relay attempt'],
  },
  {
    title: 'Links',
    body: 'Where a link really goes, before you open it.',
    signals: ['Suspicious TLD in URL', 'URL shortener detected', 'IP address used as URL host'],
  },
  {
    title: 'News stories',
    body: 'Sensational claims with no named source behind them.',
    signals: ['Unverifiable anonymous sourcing', 'Miracle-cure / absolute-certainty claim', 'Clickbait engagement hook'],
  },
  {
    title: 'Profile photos',
    body: 'Whether a profile is using a public figure’s photo, or whether two photos show the same person.',
    signals: ['Matches a known public figure', 'Doesn’t match the reference photo'],
  },
];

const buttonPrimary =
  'inline-flex h-11 items-center justify-center rounded-full bg-accent px-6 text-[15px] font-medium text-white hover:bg-accent-hover active:scale-[0.98] transition-[background-color,transform] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';
const buttonSecondary =
  'inline-flex h-11 items-center justify-center rounded-full border border-border bg-panel px-6 text-[15px] font-medium text-text-primary hover:bg-hover active:scale-[0.98] transition-[background-color,transform] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

export default function LandingPage() {
  return (
    <div className="overflow-x-clip">
      {/* Hero: the product working on a real-looking message */}
      <section className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-14 pb-20 lg:pt-24 lg:pb-28 grid gap-12 lg:gap-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center">
        <div className="max-w-[520px]">
          <h1 className="text-[40px] sm:text-[52px] lg:text-[60px] leading-[1.02] font-semibold tracking-[-0.035em] text-text-primary">
            Not sure it’s real? Paste it in.
          </h1>
          <p className="mt-6 text-[17px] sm:text-[18px] leading-[1.6] text-text-secondary max-w-[46ch]">
            Sentinel reads job offers, texts, emails, links and news stories, marks the exact
            words that look like fraud, and tells you what to do next.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link href="/signup" className={buttonPrimary}>
              Check a message
            </Link>
            <Link href="/login" className={buttonSecondary}>
              Log in
            </Link>
          </div>
          <p className="mt-4 text-[13px] text-text-muted">Free while Sentinel is in beta.</p>
        </div>

        <Specimen />
      </section>

      {/* What it reads */}
      <section aria-labelledby="checks-heading" className="border-t border-border">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-20 lg:py-28 grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start max-w-[440px]">
            <h2 id="checks-heading" className="text-[32px] sm:text-[38px] leading-[1.1] font-semibold tracking-[-0.03em]">
              Five kinds of thing you can check
            </h2>
            <p className="mt-4 text-[16px] leading-[1.6] text-text-secondary">
              Each one has its own detector. Every flag points back to the words or pixels that
              triggered it, so you never get a score without a reason.
            </p>
          </div>

          <dl className="divide-y divide-border border-y border-border">
            {checks.map((c) => (
              <div key={c.title} className="py-7 grid gap-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-8">
                <dt className="text-[17px] font-semibold text-text-primary">{c.title}</dt>
                <dd>
                  <p className="text-[15px] leading-[1.6] text-text-secondary">{c.body}</p>
                  <ul className="mt-3 flex flex-wrap gap-x-2 gap-y-2" aria-label={`Signals for ${c.title.toLowerCase()}`}>
                    {c.signals.map((s) => (
                      <li
                        key={s}
                        className="font-serif text-[14px] text-text-primary rounded-[3px] px-1.5 bg-marker/35 dark:bg-marker/15"
                      >
                        {s}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* For people building products */}
      <section aria-labelledby="api-heading" className="border-t border-border bg-panel">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-20 lg:py-24 grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16 lg:items-center">
          <div className="max-w-[440px]">
            <h2 id="api-heading" className="text-[28px] sm:text-[32px] leading-[1.15] font-semibold tracking-[-0.03em]">
              Run the same checks from your own app
            </h2>
            <p className="mt-4 text-[16px] leading-[1.6] text-text-secondary">
              Create an API key in your account and send text to Sentinel. You get back the score,
              the risk level, every signal, and the exact character ranges to highlight.
            </p>
            <Link
              href="/signup"
              className="mt-6 inline-block text-[15px] font-medium text-accent underline underline-offset-4 decoration-accent/40 hover:decoration-accent"
            >
              Get an API key
            </Link>
          </div>

          <pre
            aria-label="Example API response"
            className="overflow-x-auto rounded-[12px] border border-border bg-bg p-5 sm:p-6 text-[13px] leading-[1.7] text-text-secondary"
          >
            <code>{`{
  "risk_score": 84.0,
  "risk_level": "high",
  "signals_triggered": [
    "Account suspension threat",
    "Credential input request"
  ],
  "highlighted_spans": [
    { "start": 11, "end": 42,
      "text": "Your account has been suspended" }
  ],
  "recommendation": "Don't open the link. Call your bank."
}`}</code>
          </pre>
        </div>
      </section>

      {/* Closing call to action */}
      <section className="border-t border-border">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-20 lg:py-28 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-[560px]">
            <h2 className="text-[32px] sm:text-[40px] leading-[1.08] font-semibold tracking-[-0.03em]">
              Got something that doesn’t feel right?
            </h2>
            <p className="mt-4 text-[16px] leading-[1.6] text-text-secondary">
              Create a free account and check it now. Your scans are saved to your history so you
              can come back to them.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/signup" className={buttonPrimary}>
              Create free account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
