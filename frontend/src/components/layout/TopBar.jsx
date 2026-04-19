// frontend/src/components/layout/TopBar.jsx
// Sentinel — Unified top navigation bar (used on ALL pages)
// Context-aware: shows marketing links (public) or app links (authenticated)

import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Search, Settings, LogOut, User as UserIcon, Moon, Sun, Plus } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import useThemeStore from '@/store/themeStore';

export default function TopBar({ variant = 'auto', onOpenCommand }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef(null);

  // Determine if we're in the app context
  const isApp = variant === 'app' || (variant === 'auto' && location.pathname.startsWith('/app'));

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  // Marketing nav links (scroll to section on landing page)
  const marketingLinks = [
    { label: 'Product', href: '/#product' },
    { label: 'Features', href: '/#features' },
    { label: 'Pricing', href: '/#pricing' },
  ];

  // App nav links
  const appLinks = [
    { label: 'Scans', to: '/app' },
    { label: 'Analyze', to: '/app/analyze' },
    { label: 'History', to: '/app/history' },
  ];

  const isActiveAppLink = (to) => {
    if (to === '/app') return location.pathname === '/app';
    return location.pathname.startsWith(to);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] h-12 border-b border-background-border bg-background/80 backdrop-blur-md">
      <div className="flex items-center justify-between h-full px-4 lg:px-6 max-w-[1400px] mx-auto">

        {/* ── Left: Logo ── */}
        <Link to={isApp ? '/app' : '/'} className="flex items-center gap-2 shrink-0 group">
          <div className="w-[7px] h-[7px] rounded-full bg-accent group-hover:bg-accent-hover transition-colors" />
          <span className="text-[13px] font-bold text-text-primary tracking-tight uppercase">
            Sentinel
          </span>
        </Link>

        {/* ── Center: Navigation ── */}
        <nav className="hidden md:flex items-center gap-1">
          {isApp ? (
            // App navigation
            appLinks.map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                className={`px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors duration-100
                  ${isActiveAppLink(to)
                    ? 'text-text-primary bg-background-hover'
                    : 'text-text-secondary hover:text-text-primary hover:bg-background-hover'
                  }`}
              >
                {label}
              </Link>
            ))
          ) : (
            // Marketing navigation
            marketingLinks.map(({ label, href }) => (
              <a
                key={href}
                href={href}
                className="px-3 py-1.5 rounded-md text-[13px] font-medium text-text-secondary hover:text-text-primary hover:bg-background-hover transition-colors duration-100"
              >
                {label}
              </a>
            ))
          )}
        </nav>

        {/* ── Right: Actions ── */}
        <div className="flex items-center gap-1.5">
          {/* Command / Search bar trigger */}
          {isApp && (
            <button
              onClick={onOpenCommand}
              className="hidden sm:flex items-center gap-2 h-[30px] px-2.5 rounded-md
                         bg-background-hover border border-background-border
                         text-text-muted text-[12px] hover:text-text-secondary hover:border-text-muted/30
                         transition-colors duration-100 cursor-pointer"
            >
              <Search size={13} />
              <span className="w-32 text-left">Search…</span>
              <kbd className="px-1 py-[1px] rounded bg-background border border-background-border text-[10px] text-text-muted font-mono">
                ⌘K
              </kbd>
            </button>
          )}

          {/* New Scan quick action */}
          {isApp && (
            <Link
              to="/app/analyze"
              className="flex items-center justify-center w-[30px] h-[30px] rounded-md
                         text-text-muted hover:text-text-primary hover:bg-background-hover transition-colors"
              title="New Scan"
            >
              <Plus size={15} />
            </Link>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-[30px] h-[30px] rounded-md text-text-muted hover:text-text-primary hover:bg-background-hover transition-colors"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          {/* Auth buttons or Profile */}
          {isAuthenticated ? (
            <div className="relative ml-0.5" ref={menuRef}>
              <button
                className="flex items-center justify-center w-7 h-7 rounded-full bg-background-surface border border-background-border cursor-pointer hover:border-text-muted/50 transition-colors"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                title={user?.username || user?.email || 'User'}
              >
                <span className="text-[10px] font-semibold text-accent uppercase font-mono">
                  {(user?.username || user?.email || '?')[0]}
                </span>
              </button>

              {/* Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-panel bg-background-elevated border border-background-border overflow-hidden z-50 animate-in">
                  <div className="px-3 py-2.5 border-b border-background-border">
                    <p className="text-[12px] font-medium text-text-primary truncate">{user?.username || 'User'}</p>
                    <p className="text-[11px] text-text-muted truncate">{user?.email || 'Loading...'}</p>
                  </div>
                  <div className="py-1">
                    <Link to="/app/profile" onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-2.5 w-full px-3 py-2 text-[12px] text-text-secondary hover:bg-background-hover hover:text-text-primary transition-colors text-left">
                      <UserIcon size={13}/> Profile
                    </Link>
                    <Link to="/app/settings" onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-2.5 w-full px-3 py-2 text-[12px] text-text-secondary hover:bg-background-hover hover:text-text-primary transition-colors text-left">
                      <Settings size={13}/> Settings
                    </Link>
                  </div>
                  <div className="border-t border-background-border py-1">
                    <button onClick={handleLogout}
                            className="flex items-center gap-2.5 w-full px-3 py-2 text-[12px] text-risk-critical hover:bg-risk-critical/10 transition-colors text-left">
                      <LogOut size={13} /> Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-1">
              <Link to="/login"
                    className="text-[13px] font-medium text-text-secondary hover:text-text-primary transition-colors px-2 py-1">
                Log in
              </Link>
              <Link to="/register"
                    className="inline-flex items-center h-[30px] px-3.5 rounded-md text-[12px] font-semibold
                               bg-accent text-white hover:bg-accent-hover transition-colors">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
