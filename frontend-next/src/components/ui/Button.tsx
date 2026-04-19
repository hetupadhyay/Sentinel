import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "secondary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const variants = {
      primary: "bg-accent text-white hover:bg-accent-hover active:bg-accent-hover/90",
      secondary: "bg-panel border border-border text-text-primary hover:bg-hover active:bg-border",
      ghost: "bg-transparent text-text-secondary hover:bg-hover hover:text-text-primary",
      danger: "bg-risk-critical/10 text-risk-critical hover:bg-risk-critical/20 active:bg-risk-critical/30",
    };

    const sizes = {
      sm: "h-8 px-3 text-[12px]",
      md: "h-9 px-4 text-[13px]",
      lg: "h-10 px-6 text-[14px]",
      icon: "h-9 w-9 p-0",
    };

    return (
      <button
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium rounded-default transition-all duration-150 ease-out whitespace-nowrap focus:outline-none disabled:opacity-50 disabled:pointer-events-none select-none",
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        disabled={isLoading || disabled}
        {...props}
      >
        {isLoading && (
          <div className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
