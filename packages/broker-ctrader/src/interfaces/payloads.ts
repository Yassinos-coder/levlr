export interface CTraderTradeData {
  symbolId: number;
  volume: number;
  tradeSide: number;
  openTimestamp?: number;
}

export interface CTraderRawPosition {
  positionId: number;
  tradeData: CTraderTradeData;
  price: number;
  stopLoss?: number;
  takeProfit?: number;
  swap?: number;
  commission?: number;
  moneyDigits?: number;
}

export interface CTraderRawOrder {
  orderId: number;
  tradeData: CTraderTradeData;
  orderType: number;
  limitPrice?: number;
  stopPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  positionId?: number;
  utcLastUpdateTimestamp?: number;
}

export interface CTraderRawLightSymbol {
  symbolId: number;
  symbolName?: string;
}

export interface CTraderRawSymbol {
  symbolId: number;
  digits: number;
  pipPosition: number;
  lotSize: number;
  minVolume: number;
  maxVolume: number;
  stepVolume: number;
}

export interface CTraderRawTrader {
  balance: number;
  moneyDigits?: number;
  depositAssetId?: number;
}

export interface CTraderRawTrendbar {
  volume: number;
  low: number;
  deltaOpen: number;
  deltaClose: number;
  deltaHigh: number;
  utcTimestampInMinutes: number;
}

export interface CTraderRawSpotEvent {
  symbolId: number;
  bid?: number;
  ask?: number;
  timestamp?: number;
}

export interface CTraderRawExecutionEvent {
  executionType: number;
  position?: CTraderRawPosition & { positionStatus?: number };
  order?: CTraderRawOrder;
  deal?: { closePositionDetail?: Record<string, unknown>; executionPrice?: number; filledVolume?: number };
  errorCode?: string;
}

export interface CTraderRawAccount {
  ctidTraderAccountId: number;
  isLive: boolean;
  traderLogin?: number;
}

export interface CTraderKnownSymbol {
  symbolId: number;
  name: string;
  lotSizeCents: number;
}
