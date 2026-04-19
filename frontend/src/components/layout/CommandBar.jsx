// frontend/src/components/layout/CommandBar.jsx
// Sentinel — Command palette (⌘K) for search, navigation, and quick actions

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ScanSearch, History, ArrowRight, Zap, FileText } from 'lucide-react';

const ACTIONS = [
  { id: 'new-scan', label: 'New Scan', description: 'Start a new analysis', icon: ScanSearch, action: '/app/analyze' },
  { id: 'scans', label: 'View Scans', description: 'Go to scans feed', icon: Zap, action: '/app' },
  { id: 'history', label: 'Scan History', description: 'View all past scans', icon: History, action: '/app/history' },
  { id: 'profile', label: 'Profile', description: 'View your profile', icon: FileText, action: '/app/profile' },
];

export default function CommandBar({ open, onClose }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredActions = query
    ? ACTIONS.filter(a =>
        a.label.toLowerCase().includes(query.toLowerCase()) ||
        a.description.toLowerCase().includes(query.toLowerCase())
      )
    : ACTIONS;

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Global keyboard shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (open) {
          onClose();
        } else {
          // This is handled by the parent, but we handle close here
        }
      }
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, filteredActions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const action = filteredActions[selectedIndex];
      if (action) {
        navigate(action.action);
        onClose();
      } else if (query.trim()) {
        // Search scans
        navigate(`/app/history?search=${encodeURIComponent(query.trim())}`);
        onClose();
      }
    }
  }, [filteredActions, selectedIndex, navigate, onClose, query]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[20vh]">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-overlay animate-overlay-in"
        onClick={onClose}
      />

      {/* Command palette */}
      <div className="relative w-full max-w-lg mx-4 rounded-xl border border-background-border bg-background shadow-command animate-in overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 h-12 border-b border-background-border">
          <Search size={15} className="text-text-muted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search…"
            className="flex-1 bg-transparent text-[14px] text-text-primary placeholder:text-text-muted outline-none"
          />
          <kbd className="px-1.5 py-0.5 rounded bg-background-surface border border-background-border text-[10px] text-text-muted font-mono shrink-0">
            ESC
          </kbd>
        </div>

        {/* Actions list */}
        <div className="max-h-[280px] overflow-y-auto py-2">
          {filteredActions.length > 0 ? (
            <>
              <p className="px-4 py-1.5 text-[11px] font-medium text-text-muted uppercase tracking-wider">
                {query ? 'Results' : 'Quick Actions'}
              </p>
              {filteredActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={() => { navigate(action.action); onClose(); }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`flex items-center gap-3 w-full px-4 py-2.5 text-left transition-colors duration-75
                      ${index === selectedIndex
                        ? 'bg-accent-muted text-text-primary'
                        : 'text-text-secondary hover:bg-background-hover'
                      }`}
                  >
                    <div className={`flex items-center justify-center w-7 h-7 rounded-md shrink-0
                      ${index === selectedIndex ? 'bg-accent/20' : 'bg-background-surface'}`}>
                      <Icon size={14} className={index === selectedIndex ? 'text-accent' : 'text-text-muted'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium truncate">{action.label}</p>
                      <p className="text-[11px] text-text-muted truncate">{action.description}</p>
                    </div>
                    {index === selectedIndex && (
                      <ArrowRight size={13} className="text-text-muted shrink-0" />
                    )}
                  </button>
                );
              })}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <Search size={20} className="text-text-muted" />
              <p className="text-[13px] text-text-muted">No results found</p>
              <p className="text-[11px] text-text-muted">
                Press <kbd className="px-1 py-0.5 rounded bg-background-surface border border-background-border text-[10px] font-mono">Enter</kbd> to search scans
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-background-border">
          <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
            <kbd className="px-1 py-0.5 rounded bg-background-surface border border-background-border font-mono">↑↓</kbd>
            <span>Navigate</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
            <kbd className="px-1 py-0.5 rounded bg-background-surface border border-background-border font-mono">↵</kbd>
            <span>Select</span>
          </div>
        </div>
      </div>
    </div>
  );
}
