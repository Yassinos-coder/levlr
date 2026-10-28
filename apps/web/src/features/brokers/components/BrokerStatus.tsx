import { Plug } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { BrokerConnection } from '@/features/brokers/types/broker';

interface BrokerStatusProps {
  connections: BrokerConnection[];
  connecting: boolean;
  onConnect: () => void;
}

export function BrokerStatus({ connections, connecting, onConnect }: BrokerStatusProps) {
  return (
    <div className="flex items-center gap-2">
      {connections.map((connection) => (
        <Badge key={connection.id} variant="outline" className="gap-1.5 font-mono text-[11px]">
          <span className="size-1.5 rounded-full bg-bull shadow-[0_0_8px_var(--bull)]" />
          {connection.label ?? connection.accountId}
          <span className="text-muted-foreground uppercase">{connection.environment}</span>
        </Badge>
      ))}
      <Button variant="outline" size="sm" onClick={onConnect} disabled={connecting}>
        <Plug />
        {connections.length > 0 ? 'Reconnect' : 'Connect IC Markets'}
      </Button>
    </div>
  );
}
