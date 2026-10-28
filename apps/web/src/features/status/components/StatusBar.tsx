import type { ConnectionStatus, LatencyLevel } from '@/features/status/types/status';
import { LatencyUtils } from '@/features/status/utils/latency';

interface StatusBarProps {
  status: ConnectionStatus | undefined;
}

const DOT_CLASS: Record<LatencyLevel, string> = {
  good: 'bg-emerald-500',
  warn: 'bg-amber-400',
  bad: 'bg-red-500',
  offline: 'bg-neutral-600',
};

interface LatencyItemProps {
  label: string;
  ms: number | null;
  offlineText: string;
}

function LatencyItem({ label, ms, offlineText }: LatencyItemProps) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ${DOT_CLASS[LatencyUtils.level(ms)]}`} />
      <span>{label}</span>
      <span className="tabular-nums text-neutral-300">{ms === null ? offlineText : `${ms} ms`}</span>
    </span>
  );
}

export function StatusBar({ status }: StatusBarProps) {
  const ctraderOffline = status?.ctraderState === 'connecting' ? 'connecting…' : 'offline';

  return (
    <footer className="flex h-6 items-center justify-end gap-5 border-t border-neutral-800 px-3 text-xs text-neutral-500">
      <LatencyItem label="Backend" ms={status?.backendMs ?? null} offlineText={status ? 'offline' : '…'} />
      <LatencyItem label="cTrader" ms={status?.ctraderMs ?? null} offlineText={status ? ctraderOffline : '…'} />
    </footer>
  );
}
