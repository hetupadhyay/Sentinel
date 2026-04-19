import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "safe" | "medium" | "high" | "critical" | "outline";
  dot?: boolean;
}

function Badge({ className, variant = "default", dot = true, ...props }: BadgeProps) {
  const variants = {
    default: "text-text-secondary/70 bg-hover/50 border-border/50",
    safe: "text-risk-safe bg-risk-safe/5 border-risk-safe/10",
    medium: "text-risk-medium bg-risk-medium/5 border-risk-medium/10",
    high: "text-risk-high bg-risk-high/5 border-risk-high/10",
    critical: "text-risk-critical bg-risk-critical/5 border-risk-critical/10",
    outline: "text-text-secondary/60 bg-transparent border-border/30",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium transition-colors select-none",
        variants[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span className={cn(
          "mr-1.5 h-1.5 w-1.5 rounded-full",
          variant === 'safe' && "bg-risk-safe",
          variant === 'medium' && "bg-risk-medium",
          variant === 'high' && "bg-risk-high",
          variant === 'critical' && "bg-risk-critical",
          variant === 'default' && "bg-text-muted/50",
          variant === 'outline' && "bg-text-muted/30"
        )} />
      )}
      {props.children}
    </div>
  );
}

export { Badge };
