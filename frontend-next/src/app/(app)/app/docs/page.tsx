"use client";

import React from 'react';
import { Book, Terminal, Code, Cpu, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function DocsPage() {
  return (
    <div className="max-w-[1000px] mx-auto px-6 py-12 animate-in">
      <div className="space-y-12">
        <div className="space-y-1">
           <h1 className="text-3xl font-bold text-text-primary tracking-tight">Documentation</h1>
           <p className="text-text-muted font-medium">Learn how to integrate Sentinel into your platform.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="p-8 rounded-2xl border border-border/40 glass space-y-6 hover:border-accent/40 transition-colors cursor-pointer group">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                 <Terminal size={24} />
              </div>
              <div className="space-y-2">
                 <h3 className="text-[18px] font-bold text-text-primary flex items-center justify-between">
                    Quickstart Guide
                    <ExternalLink size={14} className="text-text-muted" />
                 </h3>
                 <p className="text-[14px] text-text-secondary leading-relaxed font-medium">Get up and running with our API in less than 5 minutes. Includes sample code for Node.js, Python, and Go.</p>
              </div>
           </div>

           <div className="p-8 rounded-2xl border border-border/40 glass space-y-6 hover:border-accent/40 transition-colors cursor-pointer group">
              <div className="w-12 h-12 rounded-xl bg-risk-safe/10 flex items-center justify-center text-risk-safe group-hover:scale-110 transition-transform">
                 <Code size={24} />
              </div>
              <div className="space-y-2">
                 <h3 className="text-[18px] font-bold text-text-primary flex items-center justify-between">
                    API Reference
                    <ExternalLink size={14} className="text-text-muted" />
                 </h3>
                 <p className="text-[14px] text-text-secondary leading-relaxed font-medium">Comprehensive documentation for every endpoint, including request parameters, response schemas, and error codes.</p>
              </div>
           </div>
        </div>

        <div className="p-8 rounded-2xl border border-border/40 bg-panel/30 space-y-6">
           <h4 className="text-[11px] font-bold text-text-primary uppercase tracking-widest flex items-center gap-2">
              <Cpu size={14} className="text-accent" />
              SDKs & Libraries
           </h4>
           <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {['Node.js', 'Python', 'Go', 'PHP'].map((sdk, i) => (
                 <div key={i} className="px-4 py-3 rounded-xl bg-bg/50 border border-border/40 text-center text-[13px] font-bold text-text-secondary hover:text-text-primary transition-colors cursor-pointer">
                    {sdk}
                 </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
