import type { AiProviderOption } from '@/features/settings/types/settings';

export const DEFAULT_AI_PROVIDER: AiProviderOption = { id: 'openai', label: 'OpenAI', keyPlaceholder: 'sk-...' };

export const AI_PROVIDER_OPTIONS: AiProviderOption[] = [
  DEFAULT_AI_PROVIDER,
  { id: 'anthropic', label: 'Anthropic (Claude)', keyPlaceholder: 'sk-ant-...' },
  { id: 'google', label: 'Google (Gemini)', keyPlaceholder: 'AIza...' },
  { id: 'mistral', label: 'Mistral', keyPlaceholder: 'Mistral API key' },
  { id: 'xai', label: 'xAI (Grok)', keyPlaceholder: 'xai-...' },
  { id: 'openrouter', label: 'OpenRouter', keyPlaceholder: 'sk-or-...' },
];

export const TOTP_CODE_LENGTH = 6;
