"use client";

import React from 'react';
import { Shield, Lock, Eye, Server } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-20 pb-32 px-6 lg:px-20 animate-in">
      <div className="max-w-[800px] mx-auto space-y-12">
        <div className="space-y-4 text-center">
          <Badge variant="outline" className="text-accent border-accent/20 bg-accent/5 px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase">Privacy Protocol</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary tracking-tight">Privacy Policy</h1>
          <p className="text-text-muted font-medium">Last updated: April 2026</p>
        </div>

        <div className="space-y-12">
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                <Shield size={18} />
              </div>
              <h2 className="text-xl font-bold text-text-primary tracking-tight">Data Protection Commitment</h2>
            </div>
            <p className="text-[15px] text-text-secondary leading-relaxed font-medium">
              At Sentinel, we prioritize your data security above all else. Our neural engine is designed with privacy-by-design principles. We do not sell your personal data to third parties. All content submitted for analysis is processed in secure, sandboxed environments.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-risk-safe/10 flex items-center justify-center text-risk-safe">
                <Eye size={18} />
              </div>
              <h2 className="text-xl font-bold text-text-primary tracking-tight">Information We Collect</h2>
            </div>
            <p className="text-[15px] text-text-secondary leading-relaxed font-medium">
              We collect information necessary to provide and improve our fraud detection services:
            </p>
            <ul className="list-disc list-inside text-[14px] text-text-muted space-y-2 ml-4">
              <li>Account information (Email, Username)</li>
              <li>Content submitted for analysis (Text, URLs, Images)</li>
              <li>Usage analytics to improve our neural models</li>
              <li>Device and browser information for security purposes</li>
            </ul>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-risk-medium/10 flex items-center justify-center text-risk-medium">
                <Lock size={18} />
              </div>
              <h2 className="text-xl font-bold text-text-primary tracking-tight">How We Use Your Data</h2>
            </div>
            <p className="text-[15px] text-text-secondary leading-relaxed font-medium">
              Your data is exclusively used to:
            </p>
            <ul className="list-disc list-inside text-[14px] text-text-muted space-y-2 ml-4">
              <li>Perform real-time fraud classification</li>
              <li>Generate detailed security reports</li>
              <li>Train our neural models against emerging threat vectors</li>
              <li>Ensure the integrity of the Sentinel ecosystem</li>
            </ul>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                <Server size={18} />
              </div>
              <h2 className="text-xl font-bold text-text-primary tracking-tight">Data Retention</h2>
            </div>
            <p className="text-[15px] text-text-secondary leading-relaxed font-medium">
              Analysis history is stored to provide you with long-term security monitoring. You can delete your scan history or your entire account at any time through the profile settings.
            </p>
          </section>
        </div>

        <div className="pt-12 border-t border-border/40 text-center">
          <p className="text-[13px] text-text-muted">
            Questions about our privacy policy? Contact us at <span className="text-accent font-bold">work.hetupadhyay@gmail.com</span>
          </p>
        </div>
      </div>
    </div>
  );
}
