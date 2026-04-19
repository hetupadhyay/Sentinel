"use client";

import React from 'react';
import { CreditCard, Zap, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function BillingPage() {
  return (
    <div className="max-w-[1000px] mx-auto px-6 py-12 animate-in">
      <div className="space-y-12">
        <div className="space-y-1">
           <h1 className="text-3xl font-bold text-text-primary tracking-tight">Billing</h1>
           <p className="text-text-muted font-medium">Manage your subscription, payment methods, and invoices.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 space-y-6">
              <div className="p-8 rounded-2xl border border-accent/20 bg-accent/[0.02] glass space-y-8">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <h3 className="text-[18px] font-bold text-text-primary flex items-center gap-2">
                          Professional Plan
                          <Badge className="bg-accent text-white text-[10px] px-2 py-0">Current</Badge>
                       </h3>
                       <p className="text-[13px] text-text-muted font-medium">Your next billing date is May 20, 2026.</p>
                    </div>
                    <div className="text-right">
                       <p className="text-2xl font-bold text-text-primary">$29</p>
                       <p className="text-[11px] text-text-muted font-bold uppercase tracking-widest">Per Month</p>
                    </div>
                 </div>

                 <div className="h-px bg-border/20" />

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                       <p className="text-[11px] font-bold text-text-primary uppercase tracking-widest">Usage this month</p>
                       <div className="space-y-1.5">
                          <div className="flex justify-between text-[12px] font-medium">
                             <span className="text-text-secondary">Analyses</span>
                             <span className="text-text-primary">1,240 / Unlimited</span>
                          </div>
                          <div className="h-1.5 w-full bg-border/20 rounded-full overflow-hidden">
                             <div className="h-full bg-accent w-[35%]" />
                          </div>
                       </div>
                    </div>
                    <div className="space-y-3">
                       <p className="text-[11px] font-bold text-text-primary uppercase tracking-widest">API Calls</p>
                       <div className="space-y-1.5">
                          <div className="flex justify-between text-[12px] font-medium">
                             <span className="text-text-secondary">Requests</span>
                             <span className="text-text-primary">45,000 / 100k</span>
                          </div>
                          <div className="h-1.5 w-full bg-border/20 rounded-full overflow-hidden">
                             <div className="h-full bg-risk-safe w-[45%]" />
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="p-8 rounded-2xl border border-border/40 glass space-y-6">
                 <h3 className="text-[14px] font-bold text-text-primary flex items-center gap-2">
                    <CreditCard size={16} className="text-text-muted" />
                    Payment Method
                 </h3>
                 <div className="flex items-center justify-between p-4 rounded-xl bg-bg/50 border border-border/40">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-6 bg-panel border border-border/60 rounded flex items-center justify-center text-[8px] font-bold">VISA</div>
                       <div className="space-y-0.5">
                          <p className="text-[13px] font-bold text-text-primary">Visa ending in 4242</p>
                          <p className="text-[11px] text-text-muted">Expiry 12/28</p>
                       </div>
                    </div>
                    <Button variant="ghost" className="text-accent text-[12px] font-bold h-8">Update</Button>
                 </div>
              </div>
           </div>

           <div className="space-y-6">
              <div className="p-6 rounded-2xl border border-border/40 bg-panel/30 space-y-4">
                 <h4 className="text-[11px] font-bold text-text-primary uppercase tracking-widest flex items-center gap-2">
                    <AlertCircle size={14} className="text-accent" />
                    Need to upgrade?
                 </h4>
                 <p className="text-[12px] text-text-secondary leading-relaxed font-medium">
                    Looking for custom neural training or SSO? Check out our Enterprise solutions.
                 </p>
                 <Button variant="ghost" className="w-full border border-border/60 h-9 text-[12px] font-bold">View Enterprise</Button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
