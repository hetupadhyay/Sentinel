import React from 'react';
import Link from 'next/link';
import { HeroDemo } from '@/components/marketing/HeroDemo';

const tiles = [
  { title: 'Job offers', line: 'Fake recruiters and upfront fees.', flag: 'Pay the registration fee' },
  { title: 'Texts and emails', line: 'Pressure to sign in or pay.', flag: 'Enter your OTP' },
  { title: 'Links', line: 'Where it really goes.', flag: 'secure-verify.xyz' },
  { title: 'News', line: 'Claims with no source.', flag: 'Doctors don’t want you to know' },
];

const primary =
  'inline-flex h-12 items-center justify-center rounded-full bg-text-primary px-7 text-[17px] font-medium text-bg hover:opacity-85 active:scale-[0.97] transition-[opacity,transform] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

export default function LandingPage() {
  return (
    <div className="overflow-x-clip">
      <section className="px-5 pt-20 pb-28 sm:pt-28 sm:pb-36 text-center">
        <h1 className="text-[48px] sm:text-[72px] lg:text-[88px] leading-[1.02] font-semibold tracking-[-0.04em]">
          Spot the scam.
        </h1>
        <p className="mt-5 text-[19px] sm:text-[24px] leading-[1.3] tracking-[-0.01em] text-text-secondary">
          Paste any message. Know if it’s safe.
        </p>
        <div className="mt-9 flex items-center justify-center gap-6">
          <Link href="/signup" className={primary}>
            Try it free
          </Link>
          <Link href="#checks" className="text-[17px] text-accent hover:underline underline-offset-4">
            See what it checks
          </Link>
        </div>

        <div className="mt-16 sm:mt-20">
          <HeroDemo />
        </div>
      </section>

      <section id="checks" className="px-5 pb-28 sm:pb-36 scroll-mt-16">
        <h2 className="text-center text-[34px] sm:text-[48px] leading-[1.08] font-semibold tracking-[-0.03em]">
          One paste. Four kinds of scam.
        </h2>
        <div className="mt-12 sm:mt-16 mx-auto max-w-[1024px] grid gap-4 sm:grid-cols-2">
          {tiles.map((t) => (
            <article
              key={t.title}
              className="flex min-h-[240px] sm:min-h-[280px] flex-col justify-between rounded-[28px] bg-panel p-8 sm:p-10"
            >
              <div>
                <h3 className="text-[24px] sm:text-[28px] font-semibold tracking-[-0.02em]">{t.title}</h3>
                <p className="mt-1 text-[17px] text-text-secondary">{t.line}</p>
              </div>
              <p className="text-[22px] sm:text-[26px] font-medium tracking-[-0.02em]">
                <mark className="rounded-[6px] bg-flag px-1.5 -mx-1.5 text-inherit box-decoration-clone">
                  {t.flag}
                </mark>
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-text-primary text-bg px-5 py-28 sm:py-36 text-center">
        <h2 className="text-[34px] sm:text-[56px] leading-[1.05] font-semibold tracking-[-0.035em]">
          Free while in beta.
        </h2>
        <Link
          href="/signup"
          className="mt-9 inline-flex h-12 items-center justify-center rounded-full bg-bg px-7 text-[17px] font-medium text-text-primary hover:opacity-90 active:scale-[0.97] transition-[opacity,transform]"
        >
          Create your account
        </Link>
      </section>
    </div>
  );
}
