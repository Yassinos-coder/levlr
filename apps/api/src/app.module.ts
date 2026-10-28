import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BrokersModule } from '@/brokers/brokers.module';
import { CacheModule } from '@/cache/cache.module';
import configuration from '@/config/configuration';
import { HealthModule } from '@/health/health.module';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    PrismaModule,
    CacheModule,
    HealthModule,
    BrokersModule,
  ],
})
export class AppModule {}
