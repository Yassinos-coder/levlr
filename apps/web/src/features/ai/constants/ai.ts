import type { ChatProvider } from '@/features/ai/types/ai';

export const CHAT_PROVIDER_OPTIONS: { id: ChatProvider; label: string; defaultModel: string }[] = [
  { id: 'anthropic', label: 'Anthropic (Claude)', defaultModel: 'claude-sonnet-5-5' },
  { id: 'openai', label: 'OpenAI', defaultModel: 'gpt-4.1' },
];

export const MAX_CONTEXT_BARS = 1000;

export const SUGGESTED_PROMPTS = [
  'How many times did price touch my level?',
  'Is my level still respected?',
  'Give me a read on this chart',
];
