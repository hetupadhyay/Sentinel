import React from 'react';

export function Card({ className = '', children, ...props }) {
  return (
    <div 
      className={`bg-background-surface border border-background-border rounded-lg ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children }) {
  return (
    <div className={`px-4 py-3 border-b border-background-border ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ className = '', children }) {
  return (
    <h3 className={`text-[13px] font-semibold text-text-primary tracking-tight ${className}`}>
      {children}
    </h3>
  );
}

export function CardContent({ className = '', children }) {
  return (
    <div className={`p-4 ${className}`}>
      {children}
    </div>
  );
}
