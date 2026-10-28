import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { ConnectionStatus, LatencyLevel } from '@/features/status/types/status';
import { LatencyUtils } from '@/features/status/utils/latency';
import { cn } from '@/lib/utils';

interface StatusBarProps {
  status: ConnectionStatus | undefined;
}

const DOT_CLASS: Record<LatencyLevel, string> = {
  good: 'bg-bull shadow-[0_0_8px_var(--bull)]',
  warn: 'bg-warn shadow-[0_0_8px_var(--warn)]',
  bad: 'bg-bear shadow-[0_0_8px_var(--bear)]',
  offline: 'bg-muted-foreground/40',
};

interface LatencyItemProps {
  label: string;
  hint: string;
  ms: number | null;
  offlineText: string;
}

function LatencyItem({ label, hint, ms, offlineText }: LatencyItemProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="flex cursor-default items-center gap-2">
          <span className={cn('size-1.5 rounded-full', DOT_CLASS[LatencyUtils.level(ms)])} />
          <span>{label}</span>
          <span className="font-mono tabular-nums text-foreground">{ms === null ? offlineText : `${ms} ms`}</span>
        </span>
      </TooltipTrigger>
      <TooltipContent side="top">{hint}</TooltipContent>
    </Tooltip>
  );
}

export function StatusBar({ status }: StatusBarProps) {
  const ctraderOffline = status?.ctraderState === 'connecting' ? 'connecting' : 'offline';

  return (
    <footer className="glass flex h-7 shrink-0 items-center justify-end gap-6 border-x-0 border-b-0 px-4 text-[11px] text-muted-foreground">
      <LatencyItem label="Backend" hint="Round trip from your browser to the Levlr API" ms={status?.backendMs ?? null} offlineText={status ? 'offline' : '...'} />
      <LatencyItem label="cTrader" hint="Round trip from the Levlr API to the cTrader server" ms={status?.ctraderMs ?? null} offlineText={status ? ctraderOffline : '...'} />
    </footer>
  );
}
