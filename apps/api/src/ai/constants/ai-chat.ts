export const CHAT_PROVIDERS = ['anthropic', 'openai'] as const;

export const MAX_TOOL_ROUNDS = 6;
export const MAX_HISTORY_MESSAGES = 20;
export const MAX_COMPLETION_TOKENS = 2048;
export const PROPOSAL_TTL_MS = 10 * 60 * 1000;
export const DEFAULT_MAX_RISK_PCT = 1;
export const DEFAULT_TOUCH_TOLERANCE_PCT = 0.05;
export const MAX_TOUCH_EVENTS_RETURNED = 20;
export const MAX_CANDLES_RETURNED = 200;
export const DEFAULT_CANDLES_RETURNED = 50;
export const REQUEST_TIMEOUT_MS = 60_000;

export const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
export const ANTHROPIC_VERSION = '2023-06-01';
export const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
