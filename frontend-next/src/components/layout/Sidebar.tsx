"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Activity, 
  ScanSearch, 
  History, 
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Scans', icon: Activity, href: '/app/scans' },
  { label: 'Analyze', icon: ScanSearch, href: '/app/analyze' },
  { label: 'History', icon: History, href: '/app/history' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 border-r border-border bg-panel flex flex-col hidden md:flex">
      <div className="h-16 flex items-center gap-2.5 px-6 border-b border-border">
        <div className="w-2.5 h-2.5 rounded-full bg-accent shadow-[0_0_8px_rgba(94,106,210,0.5)]" />
        <span className="text-[13px] font-bold text-text-primary tracking-tighter uppercase">SENTINEL</span>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1">
        <div className="px-3 mb-2 text-[10px] font-bold text-text-muted uppercase tracking-widest">Workspace</div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 h-9 rounded-lg text-[13px] font-medium transition-all duration-150 group",
                isActive 
                  ? "bg-accent/10 text-accent" 
                  : "text-text-secondary hover:bg-hover hover:text-text-primary"
              )}
            >
              <item.icon size={16} className={cn(
                "transition-colors",
                isActive ? "text-accent" : "text-text-muted group-hover:text-text-secondary"
              )} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border bg-bg/20">
        <div className="glass rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-bold text-risk-safe uppercase tracking-widest">
            <ShieldCheck size={12} />
            Secure Node
          </div>
          <p className="text-[11px] text-text-muted leading-tight">
            Encrypted & audited session active.
          </p>
        </div>
      </div>
    </aside>
  );
}

