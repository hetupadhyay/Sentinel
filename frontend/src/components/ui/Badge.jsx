import React from 'react';

export function Badge({ 
  variant = 'default', 
  dot = false,
  className = '', 
  children 
}) {
  const variants = {
    default: 'bg-background-border text-text-secondary',
    safe: 'bg-risk-safe/10 text-risk-safe',
    low: 'bg-risk-low/10 text-risk-low',
    medium: 'bg-risk-medium/10 text-risk-medium',
    high: 'bg-risk-high/10 text-risk-high',
    critical: 'bg-risk-critical/10 text-risk-critical',
  };

  const dotColors = {
    default: 'bg-text-muted',
    safe: 'bg-risk-safe',
    low: 'bg-risk-low',
    medium: 'bg-risk-medium',
    high: 'bg-risk-high',
    critical: 'bg-risk-critical',
  };

  return (
    <span className={`
      inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full 
      text-[11px] font-medium tracking-wide uppercase
      ${variants[variant]} ${className}
    `}>
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />
      )}
      {children}
    </span>
  );
}
