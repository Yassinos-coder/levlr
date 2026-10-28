export type LatencyLevel = 'good' | 'warn' | 'bad' | 'offline';

export interface HealthResponse {
  status: string;
  cache: 'up' | 'down' | 'disabled';
  ctrader: {
    state: 'connecting' | 'up' | 'down';
    latencyMs: number | null;
    measuredAt: number | null;
  };
}

export interface ConnectionStatus {
  backendMs: number | null;
  ctraderMs: number | null;
  ctraderState: HealthResponse['ctrader']['state'] | 'unknown';
}
