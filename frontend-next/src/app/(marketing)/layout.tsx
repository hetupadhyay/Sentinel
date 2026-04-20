import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-bg">
      {/* ── Navbar ── */}
      <nav className="fixed top-0 inset-x-0 z-[100] h-16 flex items-center justify-between px-6 lg:px-20 border-b border-border bg-bg/60 backdrop-blur-md">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-accent" />
            <span className="text-[13px] font-bold text-text-primary tracking-tighter uppercase">SENTINEL</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <Link href="/features" className="text-[12px] font-medium text-text-secondary hover:text-text-primary transition-colors">Features</Link>
            <Link href="/pricing" className="text-[12px] font-medium text-text-secondary hover:text-text-primary transition-colors">Pricing</Link>
            <Link href="/about" className="text-[12px] font-medium text-text-secondary hover:text-text-primary transition-colors">Company</Link>
            <Link href="/contact" className="text-[12px] font-medium text-text-secondary hover:text-text-primary transition-colors">Contact</Link>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <ThemeToggle />
          <Link href="/login" className="text-[12px] font-medium text-text-secondary hover:text-text-primary transition-colors">
            Log in
          </Link>
          <Link href="/signup">
            <Button variant="primary" className="rounded-md h-8 px-4 text-[12px] font-semibold bg-white text-black hover:bg-white/90 border-none transition-all">
              Sign up
            </Button>
          </Link>
        </div>
      </nav>

      <main className="flex-1 pt-16">
        {children}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-border py-16 bg-bg">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-20 flex flex-col md:flex-row items-start justify-between gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <span className="text-[14px] font-bold text-text-primary tracking-tighter uppercase">SENTINEL</span>
            </div>
            <p className="text-[12px] text-text-muted max-w-[200px]">
              Fraud detection at the speed of neural intelligence.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12 md:gap-24">
            <div className="space-y-4">
              <h4 className="text-[11px] font-bold text-text-primary uppercase tracking-widest">Product</h4>
              <ul className="space-y-2">
                <li><Link href="/features" className="text-[12px] text-text-muted hover:text-text-primary">Features</Link></li>
                <li><Link href="/pricing" className="text-[12px] text-text-muted hover:text-text-primary">Pricing</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-[11px] font-bold text-text-primary uppercase tracking-widest">Company</h4>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-[12px] text-text-muted hover:text-text-primary">About</Link></li>
                <li><Link href="/contact" className="text-[12px] text-text-muted hover:text-text-primary">Contact</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-[11px] font-bold text-text-primary uppercase tracking-widest">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="/privacy" className="text-[12px] text-text-muted hover:text-text-primary">Privacy</Link></li>
                <li><Link href="/terms" className="text-[12px] text-text-muted hover:text-text-primary">Terms</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-[1400px] mx-auto px-6 lg:px-20 mt-16 pt-8 border-t border-border/50">
          <p className="text-[11px] text-text-muted font-medium">© 2026 Sentinel Engineering. Built for the modern web.</p>
        </div>
      </footer>
    </div>
  );
}

