"use client";

import React, { useState } from 'react';
import { 
  Send, 
  Mail, 
  MapPin, 
  MessageSquare, 
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSent(true);
      toast.success("Message sent successfully!");
    }, 1500);
  };

  return (
    <div className="min-h-screen pt-20 pb-32 px-6 lg:px-20 animate-in">
      <div className="max-w-[1400px] mx-auto space-y-24">
        
        {/* Header */}
        <div className="max-w-[800px] space-y-6 animate-fade-up">
          <Badge variant="outline" className="text-accent border-accent/20 bg-accent/5 px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase">Get in Touch</Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-text-primary tracking-tight leading-[1.1]">
            Let's build a <br />
            <span className="text-text-muted">safer internet together.</span>
          </h1>
          <p className="text-[18px] text-text-secondary font-medium leading-relaxed max-w-[600px]">
            Have questions about our neural engine or enterprise solutions? Our team in Ahmedabad is ready to assist you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          
          {/* Contact Info */}
          <div className="space-y-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="p-8 rounded-2xl border border-border/40 bg-panel/30 space-y-4">
                 <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                    <Mail size={20} />
                 </div>
                 <h4 className="text-[15px] font-bold text-text-primary uppercase tracking-widest">Email</h4>
                 <p className="text-[13px] text-text-muted font-medium break-all">work.hetupadhyay@gmail.com</p>
              </div>
              <div className="p-8 rounded-2xl border border-border/40 bg-panel/30 space-y-4">
                 <div className="w-10 h-10 rounded-xl bg-risk-safe/10 flex items-center justify-center text-risk-safe">
                    <MapPin size={20} />
                 </div>
                 <h4 className="text-[15px] font-bold text-text-primary uppercase tracking-widest">Location</h4>
                 <p className="text-[13px] text-text-muted font-medium">Ahmedabad, Gujarat, India - 382424</p>
              </div>
              <div className="p-8 rounded-2xl border border-border/40 bg-panel/30 space-y-4">
                 <div className="w-10 h-10 rounded-xl bg-risk-medium/10 flex items-center justify-center text-risk-medium">
                    <MessageSquare size={20} />
                 </div>
                 <h4 className="text-[15px] font-bold text-text-primary uppercase tracking-widest">Support</h4>
                 <p className="text-[13px] text-text-muted font-medium">24/7 Priority Response</p>
              </div>
              <div className="p-8 rounded-2xl border border-border/40 bg-panel/30 space-y-4">
                 <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                    <Clock size={20} />
                 </div>
                 <h4 className="text-[15px] font-bold text-text-primary uppercase tracking-widest">Business Hours</h4>
                 <p className="text-[13px] text-text-muted font-medium">Mon - Fri: 9AM - 6PM IST</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="glass rounded-3xl border border-border/40 shadow-2xl p-8 lg:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 text-accent/5 pointer-events-none">
               <Send size={120} />
            </div>

            {isSent ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 animate-in">
                <div className="w-20 h-20 rounded-full bg-risk-safe/10 flex items-center justify-center text-risk-safe">
                   <CheckCircle2 size={40} />
                </div>
                <div className="space-y-2">
                   <h3 className="text-2xl font-bold text-text-primary">Message Received</h3>
                   <p className="text-text-secondary font-medium">Thank you for reaching out. Het or the Sentinel team will get back to you within 24 hours.</p>
                </div>
                <Button variant="ghost" onClick={() => setIsSent(false)} className="text-accent hover:text-accent/80 font-bold">Send another message</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Full Name</label>
                      <Input placeholder="John Doe" required className="h-12 bg-bg/50 border-border/50 text-[14px]" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Email Address</label>
                      <Input type="email" placeholder="john@company.com" required className="h-12 bg-bg/50 border-border/50 text-[14px]" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Subject</label>
                    <Input placeholder="Inquiry about Sentinel Enterprise" required className="h-12 bg-bg/50 border-border/50 text-[14px]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Message</label>
                    <textarea 
                      placeholder="Tell us about your security needs..."
                      required
                      className="w-full min-h-[160px] bg-bg/50 border border-border/50 rounded-xl p-4 text-[14px] text-text-primary placeholder:text-text-muted/40 outline-none focus:border-accent/50 transition-all resize-none font-medium"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  isLoading={isSubmitting}
                  className="w-full h-12 bg-accent text-white font-bold rounded-xl hover:bg-accent/90 shadow-lg shadow-accent/20 transition-all active:scale-[0.98]"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
                
                <p className="text-[11px] text-text-muted text-center font-medium flex items-center justify-center gap-2">
                   <AlertCircle size={12} />
                   We usually respond within 1 business day.
                </p>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
