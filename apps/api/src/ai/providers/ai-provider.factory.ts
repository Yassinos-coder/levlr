import { AnthropicProvider } from '@/ai/providers/anthropic.provider';
import { OpenAiProvider } from '@/ai/providers/openai.provider';
import type { AiProviderClient, ChatProvider } from '@/ai/interfaces';

export class AiProviderFactory {
  static create(provider: ChatProvider): AiProviderClient {
    return provider === 'openai' ? new OpenAiProvider() : new AnthropicProvider();
  }
}
