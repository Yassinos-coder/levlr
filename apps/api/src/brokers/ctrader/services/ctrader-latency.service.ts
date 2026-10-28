import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { CTraderLatencyProbe } from '@levlr/broker-ctrader';
import type { CTraderLatencySnapshot } from '@levlr/broker-ctrader';

const NOT_STARTED: CTraderLatencySnapshot = { state: 'connecting', latencyMs: null, measuredAt: null };

@Injectable()
export class CTraderLatencyService implements OnModuleInit, OnModuleDestroy {
  private probe: CTraderLatencyProbe | null = null;

  onModuleInit() {
    this.probe = new CTraderLatencyProbe('demo');
    this.probe.start();
  }

  onModuleDestroy() {
    this.probe?.stop();
  }

  getSnapshot(): CTraderLatencySnapshot {
    return this.probe?.getSnapshot() ?? NOT_STARTED;
  }
}
