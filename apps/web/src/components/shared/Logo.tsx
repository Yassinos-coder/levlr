import { cn } from '@/lib/utils';

interface LogoProps {
  showWordmark?: boolean;
  className?: string;
}

export function Logo({ showWordmark = true, className }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <svg viewBox="0 0 32 32" className="size-7" aria-hidden>
        <defs>
          <linearGradient id="levlr-mark" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="100%" stopColor="var(--violet)" />
          </linearGradient>
        </defs>
        <rect x="1" y="1" width="30" height="30" rx="9" fill="url(#levlr-mark)" opacity="0.18" />
        <rect x="1" y="1" width="30" height="30" rx="9" fill="none" stroke="url(#levlr-mark)" strokeWidth="1.5" />
        <path d="M10 8v13a2 2 0 0 0 2 2h10" fill="none" stroke="url(#levlr-mark)" strokeWidth="3" strokeLinecap="round" />
        <path d="M14 17l4-4 3 3 3-5" fill="none" stroke="var(--bull)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {showWordmark && (
        <span className="text-[15px] font-semibold tracking-tight">
          Levlr<span className="text-gradient"> Terminal</span>
        </span>
      )}
    </div>
  );
}
