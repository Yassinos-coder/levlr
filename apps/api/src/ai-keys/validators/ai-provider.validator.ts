import { BadRequestException } from '@nestjs/common';
import { AI_PROVIDERS } from '@/ai-keys/constants/ai-providers';
import type { AiProvider } from '@/ai-keys/interfaces';

export class AiProviderValidator {
  static assertSupported(provider: string): asserts provider is AiProvider {
    if (!(AI_PROVIDERS as readonly string[]).includes(provider)) {
      throw new BadRequestException(`Unsupported AI provider: ${provider}`);
    }
  }
}
