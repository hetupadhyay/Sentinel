"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  User, 
  LogOut, 
  Moon, 
  Sun,
  Search,
  Plus,
  Settings,
  ShieldCheck,
  Cpu,
  FileText
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export default function TopBar() {
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const navLinks = [
    { label: 'Scans', href: '/app' },
    { label: 'Analyze', href: '/app/analyze' },
    { label: 'History', href: '/app/history' },
  ];

  const isActive = (href: string) => {
    if (href === '/app') return pathname === '/app';
    return pathname.startsWith(href);
  };

  return (
    <header className="h-12 border-b border-border bg-bg/80 backdrop-blur-md sticky top-0 z-[100]">
      <div className="max-w-[1400px] mx-auto h-full flex items-center justify-between px-4 lg:px-6">
        
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link href="/app" className="flex items-center gap-2 group">
            <div className="w-[7px] h-[7px] rounded-full bg-accent group-hover:scale-110 transition-transform" />
            <span className="text-[13px] font-bold text-text-primary tracking-tight uppercase">
              Sentinel
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ label, href }) => (
              <Link 
                key={href}
                href={href}
                className={cn(
                  "px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors",
                  isActive(href) 
                    ? "text-text-primary bg-hover" 
                    : "text-text-secondary hover:text-text-primary hover:bg-hover"
                )}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5">
          {/* Command Trigger */}
          <button 
            className="hidden sm:flex items-center gap-2 h-8 px-2.5 rounded-md bg-hover/50 border border-border/40 text-text-muted hover:text-text-secondary transition-colors"
          >
            <Search size={13} />
            <span className="w-24 text-left text-[12px]">Search…</span>
            <kbd className="px-1 py-[1px] rounded bg-bg border border-border text-[9px] font-mono">⌘K</kbd>
          </button>

          <Link href="/app/analyze">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-text-muted hover:text-text-primary">
              <Plus size={16} />
            </Button>
          </Link>

          <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8 text-text-muted hover:text-text-primary">
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </Button>

          {/* Profile Dropdown */}
          <div className="relative ml-1" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-7 h-7 rounded-full bg-panel border border-border flex items-center justify-center hover:border-text-muted/50 transition-colors"
            >
              <span className="text-[10px] font-bold text-accent uppercase">
                {user?.username?.[0] || 'U'}
              </span>
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-panel border border-border rounded-lg shadow-xl py-1 z-50 animate-in">
                <div className="px-3 py-2 border-b border-border">
                  <p className="text-[12px] font-bold text-text-primary truncate">{user?.username}</p>
                  <p className="text-[11px] text-text-muted truncate">{user?.email}</p>
                </div>
                <div className="py-1">
                  <Link 
                    href="/app/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] text-text-secondary hover:text-text-primary hover:bg-hover transition-colors text-left"
                  >
                    <User size={14} /> Profile
                  </Link>
                  <Link 
                    href="/app/settings"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] text-text-secondary hover:text-text-primary hover:bg-hover transition-colors text-left"
                  >
                    <Settings size={14} /> Settings
                  </Link>
                </div>
                <div className="border-t border-border py-1">
                  <Link 
                    href="/privacy"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] text-text-secondary hover:text-text-primary hover:bg-hover transition-colors text-left"
                  >
                    <ShieldCheck size={14} /> Privacy Policy
                  </Link>
                  <Link 
                    href="/terms"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] text-text-secondary hover:text-text-primary hover:bg-hover transition-colors text-left"
                  >
                    <FileText size={14} /> Terms of Service
                  </Link>
                </div>
                <div className="border-t border-border py-1">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] text-risk-critical hover:bg-risk-critical/10 transition-colors text-left"
                  >
                    <LogOut size={14} /> Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
