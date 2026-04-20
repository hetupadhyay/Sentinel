// src/pages/Landing.jsx
// Sentinel — Linear-inspired marketing landing page
// Hero → Stats Bar → Features → Pricing → Multi-Column Footer

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Zap, Eye, Brain, ScanSearch, Lock, Activity, BarChart3, Clock } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import { Badge } from '@/components/ui/Badge';
import { RevealOnScroll } from '@/components/ui/RevealOnScroll';



const FEATURES = [
  {
    icon: Shield,
    title: 'Multi-Signal Detection',
    description: 'Analyze job postings, messages, URLs, images, and news articles through 6+ specialized AI detection modules.',
  },
  {
    icon: Zap,
    title: 'Real-Time Analysis',
    description: 'Get instant fraud risk assessments with detailed breakdowns of signals, attack classifications, and confidence scores.',
  },
  {
    icon: Eye,
    title: 'Explainable Results',
    description: 'Every scan highlights exactly what triggered the alert — with highlighted text spans, signal explanations, and actionable recommendations.',
  },
  {
    icon: Brain,
    title: 'AI-Powered Intelligence',
    description: 'Powered by advanced NLP models trained to detect phishing, social engineering, impersonation, and AI-generated content.',
  },
  {
    icon: Lock,
    title: 'Enterprise-Grade Security',
    description: 'Your data is encrypted at rest and in transit. Scans are processed in isolated environments with zero data retention.',
  },
];

const STATS = [
  { value: '6+', label: 'Detection Modules', icon: Shield },
  { value: '99.9%', label: 'Uptime', icon: Clock },
  { value: '<2s', label: 'Avg. Scan Time', icon: Zap },
  { value: '4.9', label: 'User Rating', icon: BarChart3 },
];

const FOOTER_COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '/#features' },
      { label: 'Pricing', href: '/#pricing' },
      { label: 'Security', href: '/#features' },
      { label: 'API', href: '/#features' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '#' },
      { label: 'Safety Guide', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Community', href: '#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Careers', href: '#' },
      { label: 'Contact', href: '#' },
      { label: 'Privacy Policy', href: '#' },
    ],
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background selection:bg-accent-muted selection:text-text-primary overflow-x-hidden">
      {/* ── Top Navigation ── */}
      <TopBar variant="public" />

      {/* ── Hero Section ── */}
      <section className="pt-32 lg:pt-44 pb-12 px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-6 animate-fade-up">
          {/* Announcement badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-muted border border-accent/10">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-[11px] font-medium text-accent/90 tracking-tight">
              Now with AI-generated content detection
            </span>
            <ArrowRight size={11} className="text-accent/60" />
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-[64px] font-extrabold text-text-primary leading-[1.05] tracking-tighter text-balance">
            Detect fraud before{' '}
            <br className="hidden sm:block" />
            it reaches you
          </h1>

          {/* Subtext */}
          <p className="text-[15px] lg:text-[17px] text-text-secondary leading-relaxed max-w-lg mx-auto">
            Multi-signal fraud detection powered by AI. Analyze job postings, messages, URLs, and more
            with explainable, real-time intelligence.
          </p>

          {/* CTA */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link to="/register"
                  className="inline-flex items-center h-11 px-6 rounded-lg text-[14px] font-semibold
                             bg-accent text-white hover:bg-accent-hover transition-colors shadow-lg shadow-accent/10 interactive-scale">
              Get Started <ArrowRight size={16} className="ml-2" />
            </Link>
            <Link to="/login"
                  className="inline-flex items-center h-11 px-6 rounded-lg text-[14px] font-medium
                             text-text-secondary hover:text-text-primary border border-background-border
                             hover:bg-background-hover transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats Trust Bar ── */}
      <section className="px-6 lg:px-8 pb-20">
        <RevealOnScroll>
          <div className="max-w-3xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {STATS.map(({ value, label, icon: Icon }, i) => (
                <div
                  key={label}
                  className="flex flex-col items-center text-center py-5 px-3 rounded-lg
                             border border-background-border bg-background-surface
                             hover:border-accent/30 transition-all duration-200 interactive-scale"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <Icon size={16} className="text-accent mb-2" />
                  <span className="text-[22px] font-extrabold text-text-primary tracking-tight">{value}</span>
                  <span className="text-[11px] text-text-secondary mt-0.5">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </RevealOnScroll>
      </section>

      {/* ── Features Section ── */}
      <section id="features" className="px-6 lg:px-8 pb-28 border-t border-background-border pt-20">
        <div className="max-w-4xl mx-auto">
          <RevealOnScroll>
            <div className="text-center mb-14">
              <p className="text-[11px] font-semibold text-accent uppercase tracking-widest mb-3">Features</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
                Everything you need to stay protected
              </h2>
              <p className="text-[14px] text-text-secondary mt-3 max-w-md mx-auto">
                Six specialized detection modules working together to identify threats across every attack vector.
              </p>
            </div>
          </RevealOnScroll>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
            {FEATURES.map(({ icon: Icon, title, description }, i) => (
              <RevealOnScroll key={title} delay={i * 0.1}>
                <div
                  className="group p-5 rounded-lg hover:bg-background-hover border border-transparent hover:border-background-border transition-all duration-200 h-full"
                >
                  <div className="w-8 h-8 rounded-md bg-accent-muted flex items-center justify-center mb-3
                                 group-hover:bg-accent/15 transition-colors">
                    <Icon size={16} className="text-accent" />
                  </div>
                  <h3 className="text-[14px] font-semibold text-text-primary mb-1.5 tracking-tight">{title}</h3>
                  <p className="text-[12px] text-text-secondary leading-relaxed">{description}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing Section (Placeholder) ── */}
      <section id="pricing" className="px-6 lg:px-8 pb-28 border-t border-background-border pt-20">
        <RevealOnScroll>
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-[11px] font-semibold text-accent uppercase tracking-widest mb-3">Pricing</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
              Free during beta
            </h2>
            <p className="text-[14px] text-text-secondary mt-3 max-w-md mx-auto">
              Sentinel is currently in open beta. All features are available at no cost.
              Get started now and be the first to know when premium plans launch.
            </p>
            <Link to="/register"
                  className="inline-flex items-center h-11 px-6 rounded-lg text-[14px] font-semibold
                             bg-accent text-white hover:bg-accent-hover transition-colors mt-6 interactive-scale">
              Start Free <ArrowRight size={16} className="ml-2" />
            </Link>
          </div>
        </RevealOnScroll>
      </section>

      {/* ── Multi-Column Footer ── */}
      <footer className="border-t border-background-border">
        {/* Main footer content */}
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-14">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 lg:gap-12">
            {/* Brand column */}
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-[7px] h-[7px] rounded-full bg-accent" />
                <span className="text-[13px] font-bold text-text-primary tracking-tight uppercase">Sentinel</span>
              </div>
              <p className="text-[12px] text-text-secondary leading-relaxed max-w-[200px]">
                Multi-signal fraud detection engine protecting users across every digital attack vector.
              </p>
            </div>

            {/* Link columns */}
            {FOOTER_COLUMNS.map(({ title, links }) => (
              <div key={title}>
                <h4 className="text-[12px] font-semibold text-text-primary tracking-tight mb-3">{title}</h4>
                <ul className="space-y-1.5">
                  {links.map(({ label, href }) => (
                    <li key={label}>
                      {href.startsWith('/') ? (
                        <Link to={href} className="footer-link">{label}</Link>
                      ) : (
                        <a href={href} className="footer-link">{label}</a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-background-border">
          <div className="max-w-5xl mx-auto px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[11px] text-text-muted">© 2026 Sentinel. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-[11px] text-text-secondary hover:text-text-primary transition-colors">Privacy</a>
              <a href="#" className="text-[11px] text-text-secondary hover:text-text-primary transition-colors">Terms</a>
              <a href="#" className="text-[11px] text-text-secondary hover:text-text-primary transition-colors">Security</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
