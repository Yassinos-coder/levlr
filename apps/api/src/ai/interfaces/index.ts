import type { CHAT_PROVIDERS } from '@/ai/constants/ai-chat';

export type ChatProvider = (typeof CHAT_PROVIDERS)[number];
export type OrderSide = 'buy' | 'sell';
export type OrderKind = 'limit' | 'stop';
export type ProposalKind = 'order' | 'close' | 'modify';
export type ProposalStatus = 'pending' | 'executing' | 'confirmed' | 'rejected' | 'expired' | 'failed';

export interface ChatMessageInput {
  role: 'user' | 'assistant';
  content: string;
}

export type BarTuple = [number, number, number, number, number];

export interface DrawingInput {
  id: string;
  kind: 'level';
  price: number;
  label?: string;
}

export interface PositionInput {
  id: string;
  symbol: string;
  side: OrderSide;
  volume: number;
  entryPrice: number;
  sl?: number;
  tp?: number;
}

export interface OrderInput {
  id: string;
  symbol: string;
  side: OrderSide;
  type: string;
  volume: number;
  price?: number;
  sl?: number;
  tp?: number;
}

export interface ChartContext {
  symbol: string;
  timeframe: string;
  bars: BarTuple[];
  drawings: DrawingInput[];
  positions: PositionInput[];
  orders: OrderInput[];
}

export interface AiSettingsRecord {
  enabled: boolean;
  provider: ChatProvider;
  model: string;
  methodologyPrompt: string | null;
  allowPlanTrades: boolean;
  allowManageTrades: boolean;
}

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface ToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
}

export interface ToolResult {
  callId: string;
  name: string;
  content: string;
}

export type ConversationTurn =
  | { role: 'user'; text: string }
  | { role: 'assistant'; text: string; toolCalls: ToolCall[] }
  | { role: 'tool'; results: ToolResult[] };

export interface ProviderRequest {
  apiKey: string;
  model: string;
  system: string;
  turns: ConversationTurn[];
  tools: ToolDefinition[];
}

export interface ProviderResponse {
  text: string;
  toolCalls: ToolCall[];
}

export interface AiProviderClient {
  complete(request: ProviderRequest): Promise<ProviderResponse>;
}

export interface OrderProposalPayload {
  symbol: string;
  side: OrderSide;
  type: OrderKind;
  entry: number;
  sl: number;
  tp?: number;
  riskPct?: number;
  lots?: number;
  rationale: string;
}

export interface ClosePositionPayload {
  positionId: string;
  symbol: string;
  volume?: number;
  rationale: string;
}

export interface ModifyPositionPayload {
  positionId: string;
  symbol: string;
  sl?: number;
  tp?: number;
  rationale: string;
}

export type ProposalPayload = OrderProposalPayload | ClosePositionPayload | ModifyPositionPayload;

export interface ProposalRow {
  id: string;
  userId: string;
  connectionId: string;
  kind: string;
  payload: unknown;
  status: string;
  expiresAt: Date;
  connection: { environment: string };
}

export interface ProposalSummary {
  id: string;
  kind: ProposalKind;
  status: ProposalStatus;
  environment: string;
  payload: ProposalPayload;
  needsSize: boolean;
  expiresAt: string;
}

export interface SizingInput {
  lots?: number;
  riskPct?: number;
}

export interface ResolvedSize {
  lots: number;
  riskPct: number;
  riskAmount: number;
}

export interface TouchEvent {
  time: string;
  bars: number;
  approach: 'from_above' | 'from_below' | 'unknown';
  outcome: 'held' | 'broke' | 'unknown';
}

export interface TouchReport {
  price: number;
  tolerance: number;
  barsAnalysed: number;
  touches: number;
  barsTouching: number;
  heldCount: number;
  brokeCount: number;
  events: TouchEvent[];
}

export interface ChatResult {
  reply: string;
  proposals: ProposalSummary[];
}

export interface ToolExecution {
  content: string;
  proposal?: ProposalSummary;
}
