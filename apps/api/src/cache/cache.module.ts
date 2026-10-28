import { Global, Module } from '@nestjs/common';
import { CacheService } from '@/cache/services/cache.service';

@Global()
@Module({ providers: [CacheService], exports: [CacheService] })
export class CacheModule {}
