import { CTRADER_PAYLOAD_TYPE, LATENCY_PROBE_INTERVAL_MS } from './constants/ctrader.constants';
import { CTraderConnection } from './ctrader-connection';
import type { CTraderEnvironment, CTraderLatencySnapshot } from './interfaces';

export class CTraderLatencyProbe {
  private connection: CTraderConnection | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private running = false;
  private snapshot: CTraderLatencySnapshot = { state: 'connecting', latencyMs: null, measuredAt: null };

  constructor(private readonly environment: CTraderEnvironment = 'demo') {}

  start() {
    if (this.running) return;
    this.running = true;
    this.tick();
  }

  stop() {
    this.running = false;
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.connection?.close();
    this.connection = null;
  }

  getSnapshot(): CTraderLatencySnapshot {
    return this.snapshot;
  }

  private async tick() {
    try {
      const connection = await this.ensureConnection();
      const startedAt = performance.now();
      await connection.request(CTRADER_PAYLOAD_TYPE.VERSION_REQ, {});
      this.snapshot = {
        state: 'up',
        latencyMs: Math.round(performance.now() - startedAt),
        measuredAt: Date.now(),
      };
    } catch {
      this.connection?.close();
      this.connection = null;
      this.snapshot = { state: 'down', latencyMs: null, measuredAt: Date.now() };
    }
    if (this.running) this.timer = setTimeout(() => this.tick(), LATENCY_PROBE_INTERVAL_MS);
  }

  private async ensureConnection(): Promise<CTraderConnection> {
    if (this.connection) return this.connection;

    const connection = new CTraderConnection();
    await connection.connect(this.environment);
    connection.onClose(() => {
      if (this.connection === connection) this.connection = null;
    });
    this.connection = connection;
    return connection;
  }
}
