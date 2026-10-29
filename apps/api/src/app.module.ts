import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiKeysModule } from '@/ai-keys/ai-keys.module';
import { AiModule } from '@/ai/ai.module';
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
    AiKeysModule,
    AiModule,
  ],
})
export class AppModule {}
