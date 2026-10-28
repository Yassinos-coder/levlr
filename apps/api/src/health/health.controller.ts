import { Controller, Get } from '@nestjs/common';
import { CacheService } from '@/cache/services/cache.service';

@Controller('health')
export class HealthController {
  constructor(private readonly cache: CacheService) {}

  @Get()
  getHealth() {
    return { status: 'ok', cache: this.cache.status, time: new Date().toISOString() };
  }
}
