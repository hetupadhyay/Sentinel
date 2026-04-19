"use client";

import React from 'react';
import { 
  Shield, 
  Search, 
  Cpu, 
  Zap, 
  Lock, 
  Globe, 
  Eye, 
  Terminal,
  Activity,
  Layers
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

const features = [
  {
    title: "Neural Content Analysis",
    description: "Our multi-signal AI engine analyzes text patterns, linguistic markers, and semantic intent to detect fraud with 99.4% accuracy.",
    icon: Cpu,
    color: "text-accent"
  },
  {
    title: "Identity Verification",
    description: "Compare suspicious profiles against official sources to detect impersonation and celebrity spoofing in real-time.",
    icon: Shield,
    color: "text-risk-safe"
  },
  {
    title: "URL Phishing Detection",
    description: "Deep scan URLs for malicious redirects, domain spoofing, and credential harvesting signals.",
    icon: Globe,
    color: "text-risk-medium"
  },
  {
    title: "Smart Job Scoring",
    description: "Heuristic-based evaluation of job postings, identifying red flags in salary, contact methods, and company legitimacy.",
    icon: Zap,
    color: "text-risk-high"
  },
  {
    title: "Privacy First Engine",
    description: "All analysis is performed in encrypted sandboxes. PII is automatically redacted before processing by our models.",
    icon: Lock,
    color: "text-accent"
  },
  {
    title: "Real-time Monitoring",
    description: "Continuous surveillance of threat actors and emerging fraud patterns across the clear and dark web.",
    icon: Activity,
    color: "text-risk-safe"
  }
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen pt-20 pb-32 px-6 lg:px-20 animate-in">
      <div className="max-w-[1400px] mx-auto space-y-24">
        
        {/* Hero Section */}
        <div className="max-w-[800px] space-y-6 animate-fade-up">
          <Badge variant="outline" className="text-accent border-accent/20 bg-accent/5 px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase">Platform Intelligence</Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-text-primary tracking-tight leading-[1.1]">
            Advanced signals. <br />
            <span className="text-text-muted">Proactive protection.</span>
          </h1>
          <p className="text-[18px] text-text-secondary font-medium leading-relaxed max-w-[600px]">
            Sentinel uses a proprietary neural architecture to classify fraud across four specialized modules, ensuring your digital presence remains secure.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          {features.map((f, i) => (
            <div key={i} className="p-8 rounded-2xl border border-border/40 glass hover:border-accent/40 transition-all duration-500 group">
              <div className={`w-12 h-12 rounded-xl bg-bg border border-border/40 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform ${f.color}`}>
                <f.icon size={24} />
              </div>
              <h3 className="text-[18px] font-bold text-text-primary mb-3">{f.title}</h3>
              <p className="text-[14px] text-text-secondary leading-relaxed font-medium">
                {f.description}
              </p>
            </div>
          ))}
        </div>

        {/* Deep Dive Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center animate-fade-up" style={{ animationDelay: '0.2s' }}>
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-text-primary">The Architecture of Trust</h2>
              <p className="text-[16px] text-text-secondary leading-relaxed font-medium">
                Unlike traditional rule-based systems, Sentinel learns from millions of verified fraud cases. Our engine doesn't just look for keywords; it understands the intent behind every interaction.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0">
                  <Layers size={20} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-[15px] font-bold text-text-primary">Multi-Layered Defense</h4>
                  <p className="text-[13px] text-text-muted">Three stages of verification: Heuristic, Statistical, and Neural.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-risk-safe/10 flex items-center justify-center text-risk-safe shrink-0">
                  <Terminal size={20} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-[15px] font-bold text-text-primary">Developer API First</h4>
                  <p className="text-[13px] text-text-muted">Integrate Sentinel into your own workflows with our high-performance SDK.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute -inset-4 bg-accent/20 blur-[100px] rounded-full opacity-30" />
            <div className="relative p-1 rounded-2xl border border-border/40 glass shadow-2xl overflow-hidden aspect-video bg-panel/30 flex items-center justify-center">
               <Activity size={60} className="text-accent/40 animate-pulse" />
               <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent opacity-60" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
