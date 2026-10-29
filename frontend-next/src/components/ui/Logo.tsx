import { cn } from '@/lib/utils';

/** Sentinel mark: an open eye on an ink tile. Colors follow the theme. */
export function LogoMark({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden className={cn('shrink-0', className)}>
      <rect width="32" height="32" rx="9" className="fill-text-primary" />
      <path
        d="M5.5 16C9.5 9.8 22.5 9.8 26.5 16C22.5 22.2 9.5 22.2 5.5 16Z"
        fill="none"
        strokeWidth="2.4"
        strokeLinejoin="round"
        className="stroke-bg"
      />
      <circle cx="16" cy="16" r="3.6" className="fill-accent" />
    </svg>
  );
}

export function Logo({ size = 22, className }: { size?: number; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-[17px] font-semibold tracking-[-0.02em] text-text-primary', className)}>
      <LogoMark size={size} />
      Sentinel
    </span>
  );
}
