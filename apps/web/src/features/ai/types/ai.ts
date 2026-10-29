export type ChatProvider = 'anthropic' | 'openai';

export interface AiSettings {
  enabled: boolean;
  provider: ChatProvider;
  model: string;
  methodologyPrompt: string | null;
  allowPlanTrades: boolean;
  allowManageTrades: boolean;
}

export type ProposalKind = 'order' | 'close' | 'modify';
export type ProposalStatus = 'pending' | 'executing' | 'confirmed' | 'rejected' | 'expired' | 'failed';

export interface OrderProposalPayload {
  symbol: string;
  side: 'buy' | 'sell';
  type: 'limit' | 'stop';
  entry: number;
  sl: number;
  tp?: number;
  riskPct?: number;
  lots?: number;
  rationale: string;
}

export interface ClosePositionPayload {
  positionId: string;
  volume?: number;
  rationale: string;
}

export interface ModifyPositionPayload {
  positionId: string;
  sl?: number;
  tp?: number;
  rationale: string;
}

export interface ProposalSummary {
  id: string;
  kind: ProposalKind;
  status: ProposalStatus;
  environment: string;
  payload: OrderProposalPayload | ClosePositionPayload | ModifyPositionPayload;
  needsSize: boolean;
  expiresAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  proposals: ProposalSummary[];
}

export interface ChatContext {
  symbol: string;
  timeframe: string;
  bars: number[][];
  drawings: { id: string; kind: 'level'; price: number; label: string }[];
  positions: {
    id: string;
    symbol: string;
    side: 'buy' | 'sell';
    volume: number;
    entryPrice: number;
    sl?: number;
    tp?: number;
  }[];
  orders: {
    id: string;
    symbol: string;
    side: 'buy' | 'sell';
    type: string;
    volume: number;
    price?: number;
    sl?: number;
    tp?: number;
  }[];
}

export interface ChatRequest {
  messages: { role: 'user' | 'assistant'; content: string }[];
  context: ChatContext;
}

export interface ChatReply {
  reply: string;
  proposals: ProposalSummary[];
}

export interface SizingChoice {
  lots?: number;
  riskPct?: number;
}
