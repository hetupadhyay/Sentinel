import React from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Logo } from '@/components/ui/Logo';

const navLinks = [
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
];

const footerLinks = [
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
];

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-bg text-text-primary">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200] focus:rounded-full focus:bg-panel focus:px-4 focus:py-2 focus:text-[13px]"
      >
        Skip to content
      </a>

      {/* Translucent bar: content scrolls underneath */}
      <header className="sticky top-0 z-[100] bg-bg/72 backdrop-blur-xl backdrop-saturate-[1.8] shadow-[inset_0_-1px_0_var(--border)]">
        <nav className="max-w-[1024px] mx-auto h-12 px-5 flex items-center justify-between">
          <Link href="/" aria-label="Sentinel home">
            <Logo />
          </Link>

          <div className="flex items-center gap-1 sm:gap-6">
            <ul className="hidden sm:flex items-center gap-6">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[13px] text-text-secondary hover:text-text-primary transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/login" className="text-[13px] text-text-secondary hover:text-text-primary transition-colors">
                  Log in
                </Link>
              </li>
            </ul>
            <ThemeToggle />
            <Link
              href="/signup"
              className="inline-flex h-8 items-center rounded-full bg-text-primary px-4 text-[13px] font-medium text-bg hover:opacity-85 active:scale-[0.97] transition-[opacity,transform]"
            >
              Sign up
            </Link>
          </div>
        </nav>
      </header>

      <main id="main" className="flex-1">
        {children}
      </main>

      <footer className="bg-panel">
        <div className="max-w-[1024px] mx-auto px-5 py-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-[13px] text-text-secondary">
          <p>© 2026 Sentinel</p>
          <ul className="flex flex-wrap gap-x-5 gap-y-1">
            {footerLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-text-primary hover:underline">
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
