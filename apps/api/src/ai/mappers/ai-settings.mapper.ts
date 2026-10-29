import type { AiSettingsRecord, ChatProvider } from '@/ai/interfaces';

const DEFAULT_SETTINGS: AiSettingsRecord = {
  enabled: false,
  provider: 'anthropic',
  model: 'claude-sonnet-5-5',
  methodologyPrompt: null,
  allowPlanTrades: false,
  allowManageTrades: false,
};

interface AiSettingsRow {
  enabled: boolean;
  provider: string;
  model: string;
  methodologyPrompt: string | null;
  allowPlanTrades: boolean;
  allowManageTrades: boolean;
}

export class AiSettingsMapper {
  static toRecord(row: AiSettingsRow | null): AiSettingsRecord {
    if (!row) return DEFAULT_SETTINGS;
    return { ...row, provider: (row.provider === 'openai' ? 'openai' : 'anthropic') as ChatProvider };
  }
}
