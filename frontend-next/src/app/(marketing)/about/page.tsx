"use client";

import React from 'react';
import { 
  MapPin, 
  Mail, 
  Share2, 
  Link as LinkIcon, 
  ExternalLink,
  ShieldCheck,
  Zap,
  Globe
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-20 pb-32 px-6 lg:px-20 animate-in">
      <div className="max-w-[1400px] mx-auto space-y-32">
        
        {/* Company Vision Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center animate-fade-up">
          <div className="space-y-8">
            <div className="space-y-6">
              <Badge variant="outline" className="text-accent border-accent/20 bg-accent/5 px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase">The Mission</Badge>
              <h1 className="text-5xl md:text-6xl font-bold text-text-primary tracking-tight leading-[1.1]">
                Neutralizing fraud <br />
                <span className="text-text-muted">through intelligence.</span>
              </h1>
              <p className="text-[18px] text-text-secondary font-medium leading-relaxed">
                Sentinel was born out of a simple observation: the digital world is growing faster than our ability to trust it. We build the neural infrastructure that restores that trust.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-8 pt-4">
              <div className="space-y-1">
                <p className="text-3xl font-bold text-text-primary">99.4%</p>
                <p className="text-[12px] text-text-muted font-bold uppercase tracking-widest">Detection Rate</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-text-primary">42+</p>
                <p className="text-[12px] text-text-muted font-bold uppercase tracking-widest">Fraud Signals</p>
              </div>
            </div>
          </div>
          
          <div className="relative aspect-square max-w-[500px] mx-auto lg:ml-auto">
             <div className="absolute -inset-10 bg-accent/20 blur-[120px] rounded-full opacity-40 animate-pulse" />
             <div className="relative w-full h-full rounded-3xl border border-border/40 glass overflow-hidden bg-panel/30 flex items-center justify-center p-12">
                <div className="grid grid-cols-2 gap-4 w-full">
                   {[1,2,3,4].map(i => (
                     <div key={i} className="aspect-square rounded-xl bg-bg/50 border border-border/40 flex items-center justify-center">
                        <ShieldCheck className={`text-accent opacity-${i*20}`} size={40} />
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>

        {/* CEO / Founder Spotlight */}
        <div className="space-y-16 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <div className="text-center space-y-4">
             <h2 className="text-3xl font-bold text-text-primary">Leadership</h2>
             <p className="text-text-muted font-medium">The visionaries behind the engine.</p>
          </div>

          <div className="max-w-[1000px] mx-auto p-1 border border-border/40 rounded-[40px] glass overflow-hidden shadow-2xl">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                <div className="p-12 lg:p-16 flex flex-col justify-center items-start space-y-8 bg-panel/10">
                   <div className="space-y-3">
                      <h3 className="text-4xl font-bold text-text-primary tracking-tight">Het Upadhyay</h3>
                      <p className="text-accent font-bold text-[14px] uppercase tracking-widest">Founder & CEO</p>
                   </div>
                   
                   <p className="text-[16px] text-text-secondary leading-relaxed font-medium">
                      "Fraud is not just a technical problem; it's a direct assault on digital freedom. At Sentinel, we aren't just building classifiers—we're building a safer internet for everyone. Our engine in Ahmedabad is just the beginning of a global security movement."
                   </p>

                   <div className="space-y-4 pt-4">
                      <div className="flex items-center gap-3 text-text-muted hover:text-text-primary transition-colors cursor-pointer">
                         <MapPin size={18} className="text-accent" />
                         <span className="text-[14px] font-medium">Ahmedabad, Gujarat, India - 382424</span>
                      </div>
                      <div className="flex items-center gap-3 text-text-muted hover:text-text-primary transition-colors cursor-pointer">
                         <Mail size={18} className="text-accent" />
                         <span className="text-[14px] font-medium">work.hetupadhyay@gmail.com</span>
                      </div>
                   </div>

                   <div className="flex gap-4 pt-4">
                      {[Share2, LinkIcon, Globe].map((Icon, i) => (
                        <button key={i} className="w-10 h-10 rounded-full border border-border/60 flex items-center justify-center text-text-muted hover:text-accent hover:border-accent/40 transition-all">
                           <Icon size={18} />
                        </button>
                      ))}
                   </div>
                </div>

                <div className="relative min-h-[400px] bg-bg overflow-hidden flex items-center justify-center p-8">
                   <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent" />
                   <div className="relative w-72 h-72 rounded-full border-[10px] border-panel shadow-2xl overflow-hidden ring-1 ring-border/50">
                      <img 
                        src="/images/ceo.png" 
                        alt="Het Upadhyay" 
                        className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-700" 
                      />
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Global Impact / Ahmedabad Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 animate-fade-up" style={{ animationDelay: '0.2s' }}>
           <div className="space-y-4">
              <Globe className="text-accent" size={24} />
              <h4 className="text-[18px] font-bold text-text-primary">Global Vision</h4>
              <p className="text-[14px] text-text-secondary leading-relaxed font-medium">Headquartered in Ahmedabad, Sentinel leverages local engineering excellence to combat global digital threats.</p>
           </div>
           <div className="space-y-4">
              <Zap className="text-risk-safe" size={24} />
              <h4 className="text-[18px] font-bold text-text-primary">Instant Response</h4>
              <p className="text-[14px] text-text-secondary leading-relaxed font-medium">Our real-time engine processes millions of signals per hour, providing instant protection across all time zones.</p>
           </div>
           <div className="space-y-4">
              <ShieldCheck className="text-risk-medium" size={24} />
              <h4 className="text-[18px] font-bold text-text-primary">Adaptive Security</h4>
              <p className="text-[14px] text-text-secondary leading-relaxed font-medium">Our neural models are updated daily, learning from new fraud vectors as they emerge in the wild.</p>
           </div>
        </div>

      </div>
    </div>
  );
}
