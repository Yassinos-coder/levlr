import type { AiProviderKeyRow, AiProviderKeySummary } from '@/ai-keys/interfaces';

export class AiKeyMapper {
  static toSummary(row: AiProviderKeyRow): AiProviderKeySummary {
    return { provider: row.provider, keyHint: row.keyHint, updatedAt: row.updatedAt.toISOString() };
  }
}
