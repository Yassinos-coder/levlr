import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KEY_HINT_LENGTH } from '@/ai-keys/constants/ai-providers';
import type { AiProviderKeySummary } from '@/ai-keys/interfaces';
import { AiKeyMapper } from '@/ai-keys/mappers/ai-key.mapper';
import { AiKeyRepository } from '@/ai-keys/repositories/ai-key.repository';
import { AiProviderValidator } from '@/ai-keys/validators/ai-provider.validator';
import { SecretCipherUtils } from '@/common/utils/secret-cipher.utils';

@Injectable()
export class AiKeysService {
  private readonly encryptionKey: string;

  constructor(
    private readonly keys: AiKeyRepository,
    config: ConfigService,
  ) {
    this.encryptionKey = config.get<string>('encryptionKey') ?? '';
  }

  async list(userId: string): Promise<AiProviderKeySummary[]> {
    const rows = await this.keys.findByUser(userId);
    return rows.map(AiKeyMapper.toSummary);
  }

  async save(userId: string, provider: string, apiKey: string): Promise<AiProviderKeySummary> {
    AiProviderValidator.assertSupported(provider);
    const trimmed = apiKey.trim();
    const row = await this.keys.upsert({
      userId,
      provider,
      secretRef: SecretCipherUtils.encrypt(trimmed, this.encryptionKey),
      keyHint: trimmed.slice(-KEY_HINT_LENGTH),
    });
    return AiKeyMapper.toSummary(row);
  }

  async getPlaintext(userId: string, provider: string): Promise<string> {
    const secret = await this.keys.findSecret(userId, provider);
    if (!secret) throw new BadRequestException(`Add your ${provider} API key in Settings → AI first`);
    return SecretCipherUtils.decrypt(secret, this.encryptionKey);
  }

  async remove(userId: string, provider: string): Promise<void> {
    AiProviderValidator.assertSupported(provider);
    await this.keys.delete(userId, provider);
  }
}
