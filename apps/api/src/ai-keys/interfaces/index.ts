import type { AI_PROVIDERS } from '@/ai-keys/constants/ai-providers';

export type AiProvider = (typeof AI_PROVIDERS)[number];

export interface AiProviderKeyRow {
  provider: string;
  keyHint: string;
  updatedAt: Date;
}

export interface AiProviderKeySummary {
  provider: string;
  keyHint: string;
  updatedAt: string;
}

export interface UpsertAiProviderKeyInput {
  userId: string;
  provider: AiProvider;
  secretRef: string;
  keyHint: string;
}
