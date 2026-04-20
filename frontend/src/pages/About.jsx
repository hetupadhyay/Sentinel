// frontend/src/pages/About.jsx
// Sentinel — About Us page with Our Story + Leadership + Mission sections

import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowRight, Users, Target, Lightbulb, Mail } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import { RevealOnScroll } from '@/components/ui/RevealOnScroll';

const VALUES = [
  {
    icon: Shield,
    title: 'Security First',
    description: 'Every decision we make is grounded in protecting users from digital threats.',
  },
  {
    icon: Target,
    title: 'Precision',
    description: 'We strive for the highest accuracy in detection — minimizing false positives while catching real threats.',
  },
  {
    icon: Lightbulb,
    title: 'Transparency',
    description: 'Every scan result is fully explainable. We believe users deserve to understand why something is flagged.',
  },
  {
    icon: Users,
    title: 'Accessibility',
    description: 'Advanced threat detection should be available to everyone, not just enterprise security teams.',
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-background selection:bg-accent-muted selection:text-text-primary overflow-x-hidden">
      <TopBar variant="public" />

      {/* ── Hero ── */}
      <section className="pt-32 lg:pt-40 pb-16 px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center animate-fade-up">
          <p className="text-[11px] font-semibold text-accent uppercase tracking-widest mb-4">About Us</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text-primary leading-[1.1] tracking-tighter text-balance">
            Protecting the digital world,{' '}
            <br className="hidden sm:block" />
            one scan at a time
          </h1>
          <p className="text-[15px] text-text-secondary mt-4 max-w-lg mx-auto leading-relaxed">
            Sentinel is built to detect fraud, phishing, and impersonation before they cause harm.
          </p>
        </div>
      </section>

      {/* ── Our Story + Leadership ── */}
      <section className="px-6 lg:px-8 pb-20">
        <div className="max-w-4xl mx-auto">
          <RevealOnScroll>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Our Story */}
              <div>
                <h2 className="text-xl font-bold text-text-primary tracking-tight mb-4">Our Story</h2>
                <div className="space-y-4 text-[13px] text-text-secondary leading-relaxed">
                  <p>
                    Born out of a necessity to bridge the gap between cybersecurity expertise and everyday
                    online safety, Sentinel was created to give individuals and teams peace of mind. We
                    recognized that the digital landscape was evolving faster than traditional security
                    tools could handle.
                  </p>
                  <p>
                    Today, we leverage cutting-edge artificial intelligence to analyze behavioral patterns,
                    detect threats in real-time, and provide actionable insights — all without requiring
                    deep security knowledge from the user.
                  </p>
                  <p>
                    Our multi-signal detection engine processes job postings, messages, URLs, images, and
                    news articles through specialized AI modules, each trained to identify specific attack
                    vectors with high precision.
                  </p>
                </div>
              </div>

              {/* Leadership Card */}
              <div className="profile-section p-6">
                <h2 className="text-lg font-bold text-text-primary tracking-tight mb-4">Our Leadership</h2>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-[15px] font-bold text-text-primary">Het Upadhyay</h3>
                    <p className="text-[12px] text-accent font-semibold">Founder & Lead Engineer</p>
                  </div>

                  <p className="text-[12px] text-text-secondary leading-relaxed">
                    Het is the visionary behind Sentinel, bringing deep expertise in software architecture,
                    machine learning, and cybersecurity. His technical leadership drives continuous innovation
                    to protect users across every digital attack vector, ensuring the AI engines stay ahead
                    of emerging threats.
                  </p>

                  <div className="flex items-center gap-2 pt-2">
                    <Mail size={13} className="text-text-muted" />
                    <a href="mailto:contact@sentinel.dev" className="text-[12px] text-accent hover:underline">
                      contact@sentinel.dev
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ── Mission & Values ── */}
      <section className="px-6 lg:px-8 pb-28 border-t border-background-border pt-20">
        <div className="max-w-4xl mx-auto">
          <RevealOnScroll>
            <div className="text-center mb-14">
              <p className="text-[11px] font-semibold text-accent uppercase tracking-widest mb-3">Our Values</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
                What drives us
              </h2>
              <p className="text-[14px] text-text-secondary mt-3 max-w-md mx-auto">
                The principles that guide every feature we build and every decision we make.
              </p>
            </div>
          </RevealOnScroll>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {VALUES.map(({ icon: Icon, title, description }, i) => (
              <RevealOnScroll key={title} delay={i * 0.1}>
                <div className="group p-5 rounded-lg border border-background-border hover:border-accent/20 bg-background-surface hover:bg-background-hover transition-all duration-200">
                  <div className="w-9 h-9 rounded-md bg-accent-muted flex items-center justify-center mb-3
                                 group-hover:bg-accent/15 transition-colors">
                    <Icon size={18} className="text-accent" />
                  </div>
                  <h3 className="text-[14px] font-semibold text-text-primary mb-1.5 tracking-tight">{title}</h3>
                  <p className="text-[12px] text-text-secondary leading-relaxed">{description}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 lg:px-8 pb-20">
        <RevealOnScroll>
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-text-primary tracking-tight mb-3">
              Ready to stay protected?
            </h2>
            <p className="text-[14px] text-text-secondary mb-6">
              Join Sentinel and start detecting fraud before it reaches you.
            </p>
            <Link to="/register"
                  className="inline-flex items-center h-11 px-6 rounded-lg text-[14px] font-semibold
                             bg-accent text-white hover:bg-accent-hover transition-colors interactive-scale">
              Get Started <ArrowRight size={16} className="ml-2" />
            </Link>
          </div>
        </RevealOnScroll>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-background-border py-8">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-[6px] h-[6px] rounded-full bg-accent" />
            <span className="text-[12px] font-bold text-text-primary tracking-tight uppercase">Sentinel</span>
          </div>
          <p className="text-[11px] text-text-muted">© 2026 Sentinel. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/" className="text-[11px] text-text-secondary hover:text-text-primary transition-colors">Home</Link>
            <a href="#" className="text-[11px] text-text-secondary hover:text-text-primary transition-colors">Privacy</a>
            <a href="#" className="text-[11px] text-text-secondary hover:text-text-primary transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
