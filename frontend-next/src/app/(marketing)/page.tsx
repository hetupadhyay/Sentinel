import React from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  Shield, 
  Zap, 
  Eye, 
  Brain, 
  Lock 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { RevealOnScroll } from '@/components/ui/RevealOnScroll';

const features = [
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

export default function LandingPage() {
  return (
    <div className="bg-bg min-h-screen text-text-primary selection:bg-accent/30 overflow-x-hidden font-sans">
      
      {/* ── 1. Hero Section ── */}
      <section className="relative px-6 lg:px-8 pt-32 lg:pt-48 pb-32 overflow-hidden">
        {/* Soft background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-accent/5 blur-[120px] rounded-full pointer-events-none -z-10" />
        
        <div className="max-w-[900px] mx-auto text-center space-y-10 animate-fade-up">
          {/* Announcement */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-panel border border-border/50">
            <span className="flex h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-[11px] font-medium text-text-secondary tracking-tight">
              AI-generated content detection is now live
            </span>
            <ArrowRight size={11} className="text-text-muted/60" />
          </div>

          <div className="space-y-6">
            <h1 className="text-5xl lg:text-[72px] font-bold leading-[1.05] tracking-tighter text-text-primary">
              Detect fraud before <br />
              <span className="text-text-secondary/50">it reaches you.</span>
            </h1>
            <p className="text-[16px] lg:text-[19px] text-text-secondary leading-relaxed max-w-[600px] mx-auto font-medium">
              Multi-signal fraud detection powered by AI. Analyze job postings, 
              messages, and URLs with explainable, real-time intelligence.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-6">
            <Link href="/signup">
              <Button variant="primary" className="h-11 px-7 text-[14px] font-bold rounded-lg bg-white text-black hover:bg-white/90 active:scale-95 transition-all shadow-xl shadow-white/5">
                Get started for free
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" className="h-11 px-7 text-[14px] font-bold rounded-lg border-border hover:bg-panel active:scale-95 transition-all">
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 2. Features Section ── */}
      <section id="features" className="max-w-[1200px] mx-auto px-6 lg:px-8 py-32 border-t border-border">
        <RevealOnScroll>
          <div className="text-center mb-20 space-y-3">
            <p className="text-[11px] font-bold text-accent uppercase tracking-widest">Features</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-text-primary tracking-tight">
              Everything you need to stay protected
            </h2>
            <p className="text-[14px] text-text-secondary max-w-[450px] mx-auto leading-relaxed">
              Six specialized detection modules working together to identify threats across every attack vector.
            </p>
          </div>
        </RevealOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
          {features.map((f, i) => (
            <RevealOnScroll key={i} delay={i * 0.1}>
              <div className="p-6 rounded-xl hover:bg-hover border border-transparent hover:border-border transition-all h-full group">
                <div className="w-10 h-10 rounded-lg bg-panel border border-border flex items-center justify-center text-text-secondary group-hover:text-accent group-hover:border-accent/30 transition-all mb-6">
                  <f.icon size={20} />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[15px] font-bold text-text-primary tracking-tight">{f.title}</h4>
                  <p className="text-[13px] text-text-secondary leading-relaxed font-medium">
                    {f.description}
                  </p>
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </section>

      {/* ── 3. CTA Section ── */}
      <section id="pricing" className="relative border-t border-border py-40 bg-panel/20 overflow-hidden">
        {/* Glow effect */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent/5 blur-[100px] rounded-full pointer-events-none -z-10" />
        
        <div className="max-w-[1400px] mx-auto px-6 lg:px-20 text-center space-y-12">
          <RevealOnScroll>
            <div className="space-y-6">
              <p className="text-[11px] font-bold text-accent uppercase tracking-widest">Open Beta</p>
              <h2 className="text-4xl lg:text-6xl font-bold text-text-primary tracking-tighter leading-tight">
                Free during beta. <br /> Protect your team today.
              </h2>
              <p className="text-[16px] text-text-secondary max-w-[500px] mx-auto font-medium">
                Start protecting your users from phishing and fraud. 
                Full access to all AI modules at no cost during beta.
              </p>
            </div>
          </RevealOnScroll>
          
          <RevealOnScroll delay={0.2}>
            <div className="flex items-center justify-center gap-4">
              <Link href="/signup">
                <Button variant="primary" className="h-11 px-8 text-[14px] font-bold rounded-lg bg-white text-black hover:bg-white/90 active:scale-95 transition-all">
                  Get started for free
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="secondary" className="h-11 px-8 text-[14px] font-bold rounded-lg border-border hover:bg-panel active:scale-95 transition-all">
                  Sign in
                </Button>
              </Link>
            </div>
          </RevealOnScroll>
        </div>
      </section>
    </div>
  );
}


