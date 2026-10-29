import { cn } from '@/lib/utils';

/** Sentinel mark: an open eye, glancing right, on an ink tile. Colors follow the theme. */
export function LogoMark({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden className={cn('shrink-0', className)}>
      <rect width="32" height="32" rx="9" className="fill-text-primary" />
      <path d="M5 16.5C9.6 10.2 22.4 10.2 27 16.5C22.4 21.8 9.6 21.8 5 16.5Z" className="fill-bg" />
      <circle cx="17.6" cy="16.2" r="4.3" className="fill-accent" />
      <circle cx="19" cy="14.8" r="1.2" className="fill-bg" />
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
