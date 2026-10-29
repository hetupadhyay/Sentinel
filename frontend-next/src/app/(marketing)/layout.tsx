import React from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

const navLinks = [
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

const footerLinks = [
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
];

function Wordmark() {
  return (
    <span className="flex items-center gap-2">
      {/* A marked line: the product's one idea, reduced to a glyph */}
      <svg width="18" height="14" viewBox="0 0 18 14" aria-hidden className="shrink-0">
        <rect x="0" y="1" width="18" height="3" rx="1.5" className="fill-text-primary" />
        <rect x="0" y="7" width="12" height="5" rx="1.5" className="fill-marker" />
        <rect x="0" y="8.5" width="12" height="2" rx="1" className="fill-text-primary" />
      </svg>
      <span className="text-[16px] font-semibold tracking-tight text-text-primary">Sentinel</span>
    </span>
  );
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-bg text-text-primary">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200] focus:rounded-md focus:bg-panel focus:px-3 focus:py-2 focus:text-[13px]"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-[100] border-b border-border bg-bg/85 backdrop-blur-md">
        <nav className="max-w-[1200px] mx-auto h-16 px-5 sm:px-8 flex items-center justify-between gap-6">
          <div className="flex items-center gap-10">
            <Link href="/" aria-label="Sentinel home" className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
              <Wordmark />
            </Link>
            <ul className="hidden md:flex items-center gap-7">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[14px] text-text-secondary hover:text-text-primary transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />
            <Link href="/login" className="hidden sm:inline text-[14px] text-text-secondary hover:text-text-primary transition-colors">
              Log in
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-9 items-center rounded-full bg-accent px-4 text-[14px] font-medium text-white hover:bg-accent-hover transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Sign up
            </Link>
          </div>
        </nav>
      </header>

      <main id="main" className="flex-1">
        {children}
      </main>

      <footer className="border-t border-border">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Wordmark />
            <p className="text-[13px] text-text-muted">© 2026 Sentinel</p>
          </div>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {footerLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-[13px] text-text-secondary hover:text-text-primary transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </footer>
    </div>
  );
}
