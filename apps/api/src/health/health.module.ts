import { Module } from '@nestjs/common';
import { BrokersModule } from '@/brokers/brokers.module';
import { HealthController } from '@/health/health.controller';

@Module({ imports: [BrokersModule], controllers: [HealthController] })
export class HealthModule {}
