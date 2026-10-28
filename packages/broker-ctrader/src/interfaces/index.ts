export * from './payloads';

export type CTraderEnvironment = 'demo' | 'live';

export interface CTraderAppConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface CTraderTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface CTraderTokenResponse {
  accessToken?: string;
  tokenType?: string;
  expiresIn?: number;
  refreshToken?: string;
  errorCode?: string | null;
  description?: string | null;
}

export interface CTraderMessage<TPayload = Record<string, unknown>> {
  clientMsgId?: string;
  payloadType: number;
  payload: TPayload;
}

export type CTraderEventListener = (message: CTraderMessage) => void;

export interface CTraderNewOrderParams {
  symbolId: number;
  orderType: number;
  tradeSide: number;
  volumeUnits: number;
  limitPrice?: number;
  stopPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  clientOrderId?: string;
}

export type CTraderLatencyState = 'connecting' | 'up' | 'down';

export interface CTraderLatencySnapshot {
  state: CTraderLatencyState;
  latencyMs: number | null;
  measuredAt: number | null;
}
