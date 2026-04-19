"use client";

import React from 'react';
import { FileText, Gavel, Scale, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export default function TermsPage() {
  return (
    <div className="min-h-screen pt-20 pb-32 px-6 lg:px-20 animate-in">
      <div className="max-w-[800px] mx-auto space-y-12">
        <div className="space-y-4 text-center">
          <Badge variant="outline" className="text-accent border-accent/20 bg-accent/5 px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase">Legal Framework</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary tracking-tight">Terms of Service</h1>
          <p className="text-text-muted font-medium">Last updated: April 2026</p>
        </div>

        <div className="space-y-12">
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                <FileText size={18} />
              </div>
              <h2 className="text-xl font-bold text-text-primary tracking-tight">1. Acceptance of Terms</h2>
            </div>
            <p className="text-[15px] text-text-secondary leading-relaxed font-medium">
              By accessing or using Sentinel, you agree to be bound by these Terms of Service. If you do not agree to all terms, you may not access the service.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-risk-safe/10 flex items-center justify-center text-risk-safe">
                <Gavel size={18} />
              </div>
              <h2 className="text-xl font-bold text-text-primary tracking-tight">2. Use of Service</h2>
            </div>
            <p className="text-[15px] text-text-secondary leading-relaxed font-medium">
              You agree to use the service only for lawful purposes. You are prohibited from:
            </p>
            <ul className="list-disc list-inside text-[14px] text-text-muted space-y-2 ml-4">
              <li>Using Sentinel to conduct malicious scans or harass others</li>
              <li>Attempting to bypass security filters or neural safeguards</li>
              <li>Reverse engineering the detection engine</li>
              <li>Automating scans beyond the specified API limits</li>
            </ul>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-risk-medium/10 flex items-center justify-center text-risk-medium">
                <AlertCircle size={18} />
              </div>
              <h2 className="text-xl font-bold text-text-primary tracking-tight">3. Disclaimer of Warranties</h2>
            </div>
            <p className="text-[15px] text-text-secondary leading-relaxed font-medium">
              Sentinel is a fraud detection tool provided "as is". While our engine has a 99.4% accuracy rate, no system can provide 100% certainty. We are not liable for any losses resulting from false positives or false negatives.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                <Scale size={18} />
              </div>
              <h2 className="text-xl font-bold text-text-primary tracking-tight">4. Intellectual Property</h2>
            </div>
            <p className="text-[15px] text-text-secondary leading-relaxed font-medium">
              All proprietary algorithms, UI designs, and the "Sentinel" brand are the intellectual property of Het Upadhyay and the Sentinel team. Unauthorized reproduction is strictly prohibited.
            </p>
          </section>
        </div>

        <div className="pt-12 border-t border-border/40 text-center">
          <p className="text-[13px] text-text-muted">
            For legal inquiries, contact <span className="text-accent font-bold">work.hetupadhyay@gmail.com</span>
          </p>
        </div>
      </div>
    </div>
  );
}
