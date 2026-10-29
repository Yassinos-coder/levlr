import { BaseApiClient } from '@/lib/baseApiClient';
import type { AiProviderId, AiProviderKey } from '@/features/settings/types/settings';

class AiKeyService extends BaseApiClient {
  list() {
    return this.get<AiProviderKey[]>('/ai/keys');
  }

  save(provider: AiProviderId, apiKey: string) {
    return this.put<AiProviderKey>(`/ai/keys/${provider}`, { apiKey });
  }

  remove(provider: AiProviderId) {
    return this.delete(`/ai/keys/${provider}`);
  }
}

export const aiKeyService = new AiKeyService();
