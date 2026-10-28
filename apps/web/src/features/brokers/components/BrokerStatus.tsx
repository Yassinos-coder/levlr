import type { BrokerConnection } from '@/features/brokers/types/broker';

interface BrokerStatusProps {
  connections: BrokerConnection[];
  connecting: boolean;
  errorMessage?: string;
  onConnect: () => void;
}

export function BrokerStatus({ connections, connecting, errorMessage, onConnect }: BrokerStatusProps) {
  return (
    <div className="flex items-center gap-2">
      {connections.map((connection) => (
        <span key={connection.id} className="rounded bg-neutral-800 px-2 py-0.5 text-emerald-400">
          {connection.label ?? connection.accountId} · {connection.environment}
        </span>
      ))}
      {errorMessage && <span className="text-red-400">{errorMessage}</span>}
      <button
        type="button"
        onClick={onConnect}
        disabled={connecting}
        className="rounded border border-neutral-700 px-2 py-0.5 hover:border-neutral-500 disabled:opacity-50"
      >
        {connections.length > 0 ? 'Reconnect' : 'Connect IC Markets'}
      </button>
    </div>
  );
}
