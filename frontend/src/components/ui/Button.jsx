import React from 'react';

export function Button({ 
  variant = 'secondary', 
  className = '', 
  children, 
  ...props 
}) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 h-9 px-3.5 text-[13px] font-medium rounded-md transition-colors duration-150 ease-out whitespace-nowrap focus:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:opacity-50 disabled:pointer-events-none select-none';
  
  const variants = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-hover/90',
    secondary: 'bg-background-surface border border-background-border text-text-primary hover:bg-background-hover active:bg-background-border',
    ghost: 'bg-transparent border border-transparent text-text-secondary hover:bg-background-hover hover:text-text-primary active:bg-background-border',
    danger: 'bg-risk-critical/10 text-risk-critical hover:bg-risk-critical/20 active:bg-risk-critical/30',
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
