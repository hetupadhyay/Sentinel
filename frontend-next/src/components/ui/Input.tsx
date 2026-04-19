import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <input
          type={type}
          className={cn(
            "flex h-9 w-full rounded-default border border-border bg-bg px-3 py-1 text-[13px] transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-muted focus:outline-none focus:border-accent focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-risk-critical focus:border-risk-critical",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1 text-[11px] text-risk-critical animate-fade-in">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
