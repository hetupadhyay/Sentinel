"use client";

import React from 'react';
import { Check, Zap, Shield, Crown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

const plans = [
  {
    name: "Starter",
    price: "0",
    description: "For individuals looking to stay safe online.",
    features: [
      "10 analyses per day",
      "Standard Neural Engine",
      "Community Support",
      "Basic URL Scanning",
      "Manual Text Input"
    ],
    icon: Shield,
    color: "text-text-muted",
    cta: "Start for free",
    popular: false
  },
  {
    name: "Professional",
    price: "29",
    description: "Advanced protection for power users and creators.",
    features: [
      "Unlimited analyses",
      "High-Priority Engine",
      "24/7 Expert Support",
      "Impersonation Module",
      "API Access (Early)",
      "Detailed Signal Reports"
    ],
    icon: Zap,
    color: "text-accent",
    cta: "Get Started",
    popular: true
  },
  {
    name: "Enterprise",
    price: "99",
    description: "Scale-ready security for teams and businesses.",
    features: [
      "Dedicated Infrastructure",
      "Full API Access",
      "Custom Neural Training",
      "SAML/SSO Integration",
      "Admin Dashboard",
      "Bulk Analysis Tools"
    ],
    icon: Crown,
    color: "text-risk-safe",
    cta: "Contact Sales",
    popular: false
  }
];

export default function PricingPage() {
  return (
    <div className="min-h-screen pt-20 pb-32 px-6 lg:px-20 animate-in">
      <div className="max-w-[1400px] mx-auto space-y-24">
        
        {/* Header */}
        <div className="text-center space-y-6 max-w-[800px] mx-auto animate-fade-up">
          <Badge variant="outline" className="text-accent border-accent/20 bg-accent/5 px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase">Pricing Plans</Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-text-primary tracking-tight">
            Security that scales <br />
            <span className="text-text-muted">with your needs.</span>
          </h1>
          <p className="text-[18px] text-text-secondary font-medium max-w-[600px] mx-auto">
            Choose the plan that's right for you. No hidden fees, no long-term contracts.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          {plans.map((plan, i) => (
            <div 
              key={i} 
              className={`relative p-8 rounded-3xl border transition-all duration-500 flex flex-col h-full group
                ${plan.popular 
                  ? "bg-accent/[0.03] border-accent/40 shadow-[0_0_40px_rgba(94,106,210,0.1)]" 
                  : "bg-panel/30 border-border/40 hover:border-border"
                }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-accent text-white px-3 py-1 shadow-lg shadow-accent/20 border-none">Most Popular</Badge>
                </div>
              )}

              <div className="space-y-6 flex-1">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-bg border border-border/40 flex items-center justify-center ${plan.color}`}>
                    <plan.icon size={20} />
                  </div>
                  <h3 className="text-[20px] font-bold text-text-primary">{plan.name}</h3>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-text-primary">${plan.price}</span>
                  <span className="text-text-muted text-[14px]">/month</span>
                </div>

                <p className="text-[14px] text-text-secondary leading-relaxed font-medium">
                  {plan.description}
                </p>

                <div className="h-px bg-border/40" />

                <ul className="space-y-4">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3 text-[13px] text-text-secondary font-medium">
                      <div className="w-4 h-4 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0">
                        <Check size={10} />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-12">
                <Button 
                  variant={plan.popular ? "primary" : "ghost"} 
                  className={`w-full h-12 rounded-xl text-[14px] font-bold transition-all active:scale-95
                    ${plan.popular ? "bg-accent text-white hover:bg-accent/90" : "bg-panel/50 border border-border/60 hover:bg-hover"}
                  `}
                >
                  {plan.cta}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-[800px] mx-auto space-y-12 animate-fade-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-3xl font-bold text-text-primary text-center">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <h4 className="text-[15px] font-bold text-text-primary">Can I cancel anytime?</h4>
              <p className="text-[13px] text-text-secondary leading-relaxed">Yes, you can cancel your subscription at any time from your billing settings. You'll retain access until the end of your billing cycle.</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-[15px] font-bold text-text-primary">Do you offer custom plans?</h4>
              <p className="text-[13px] text-text-secondary leading-relaxed">Absolutely. Our Enterprise plan can be tailored to your specific volume and compliance requirements.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
