import { Module } from '@nestjs/common';
import { AiKeysController } from '@/ai-keys/controllers/ai-keys.controller';
import { AiKeyRepository } from '@/ai-keys/repositories/ai-key.repository';
import { AiKeysService } from '@/ai-keys/services/ai-keys.service';

@Module({
  controllers: [AiKeysController],
  providers: [AiKeysService, AiKeyRepository],
  exports: [AiKeysService],
})
export class AiKeysModule {}
