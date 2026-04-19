import React, { forwardRef } from 'react';

export const Input = forwardRef(({ className = '', error, ...props }, ref) => {
  return (
    <div className="relative w-full">
      <input
        ref={ref}
        className={`
          w-full h-9 px-3 text-[13px] text-text-primary bg-background 
          border rounded-md transition-colors duration-150 ease-out outline-none
          placeholder:text-text-muted
          ${error 
            ? 'border-risk-critical focus:border-risk-critical' 
            : 'border-background-border focus:border-primary'}
          ${className}
        `}
        {...props}
      />
      {error && (
        <span className="absolute -bottom-5 left-0 text-[11px] text-risk-critical">
          {error}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';
