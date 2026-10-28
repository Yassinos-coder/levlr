import { Controller, Get } from '@nestjs/common';
import { CTraderLatencyService } from '@/brokers/ctrader/services/ctrader-latency.service';
import { CacheService } from '@/cache/services/cache.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly cache: CacheService,
    private readonly ctraderLatency: CTraderLatencyService,
  ) {}

  @Get()
  getHealth() {
    return {
      status: 'ok',
      cache: this.cache.status,
      ctrader: this.ctraderLatency.getSnapshot(),
      time: new Date().toISOString(),
    };
  }
}
