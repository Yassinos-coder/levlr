import type { ConnectionStatus, HealthResponse } from '@/features/status/types/status';

class StatusService {
  async measure(): Promise<ConnectionStatus> {
    const startedAt = performance.now();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/health`, { cache: 'no-store' });
      if (!response.ok) return StatusService.offline();

      const backendMs = Math.round(performance.now() - startedAt);
      const health = (await response.json()) as HealthResponse;
      return { backendMs, ctraderMs: health.ctrader.latencyMs, ctraderState: health.ctrader.state };
    } catch {
      return StatusService.offline();
    }
  }

  private static offline(): ConnectionStatus {
    return { backendMs: null, ctraderMs: null, ctraderState: 'unknown' };
  }
}

export const statusService = new StatusService();
