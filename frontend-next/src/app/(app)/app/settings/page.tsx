"use client";

import React from 'react';
import { Settings, Bell, Lock, Eye, Globe, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function SettingsPage() {
  return (
    <div className="max-w-[1000px] mx-auto px-6 py-12 animate-in">
      <div className="space-y-12">
        <div className="space-y-1">
           <h1 className="text-3xl font-bold text-text-primary tracking-tight">Settings</h1>
           <p className="text-text-muted font-medium">Configure your account and platform preferences.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="md:col-span-1 space-y-1">
              <nav className="flex flex-col gap-1">
                 {['General', 'Notifications', 'Security', 'Privacy', 'Integrations'].map((item, i) => (
                    <button key={i} className={`text-left px-4 py-2.5 rounded-lg text-[13px] font-bold transition-all ${i === 0 ? 'bg-hover text-text-primary' : 'text-text-secondary hover:bg-hover hover:text-text-primary'}`}>
                       {item}
                    </button>
                 ))}
              </nav>
           </div>

           <div className="md:col-span-2 space-y-8">
              <div className="p-8 rounded-2xl border border-border/40 glass space-y-8">
                 <div className="space-y-6">
                    <h3 className="text-[14px] font-bold text-text-primary flex items-center gap-2">
                       <Zap size={16} className="text-accent" />
                       Analysis Preferences
                    </h3>
                    
                    <div className="space-y-6">
                       <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                             <p className="text-[13px] font-bold text-text-primary">Auto-redact PII</p>
                             <p className="text-[12px] text-text-muted">Automatically hide sensitive info before analysis.</p>
                          </div>
                          <div className="w-10 h-5 rounded-full bg-accent relative cursor-pointer">
                             <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                          </div>
                       </div>
                       <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                             <p className="text-[13px] font-bold text-text-primary">High-Intensity Neural Scan</p>
                             <p className="text-[12px] text-text-muted">Enable deeper pattern recognition (slower).</p>
                          </div>
                          <div className="w-10 h-5 rounded-full bg-border/40 relative cursor-pointer">
                             <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full" />
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="h-px bg-border/20" />

                 <div className="flex justify-end">
                    <Button variant="primary" className="bg-accent text-white font-bold h-10 px-6 rounded-lg">Save Changes</Button>
                 </div>
              </div>

              <div className="p-8 rounded-2xl border border-risk-critical/20 bg-risk-critical/[0.02] space-y-4">
                 <h3 className="text-[14px] font-bold text-risk-critical uppercase tracking-widest">Danger Zone</h3>
                 <p className="text-[12px] text-text-secondary font-medium">Permanently delete your account and all associated scan data. This action cannot be undone.</p>
                 <Button variant="ghost" className="text-risk-critical border border-risk-critical/20 hover:bg-risk-critical/10 h-10 px-6 font-bold">Delete Account</Button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
