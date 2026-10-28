import type { OrderSide, OrderType } from './trading.interface';

export interface BrokerCredentials {
  accessToken: string;
  refreshToken?: string;
  accountId: string;
  environment: 'demo' | 'live';
}

export interface AccountInfo {
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  currency: string;
}

export interface BrokerPosition {
  id: string;
  symbol: string;
  side: OrderSide;
  volume: number;
  entryPrice: number;
  sl?: number;
  tp?: number;
  openedAt: number;
  swap: number;
  commission: number;
}

export interface BrokerOrder {
  id: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  volume: number;
  price?: number;
  sl?: number;
  tp?: number;
  createdAt: number;
}

export interface AccountSnapshot {
  account: AccountInfo;
  positions: BrokerPosition[];
  orders: BrokerOrder[];
}
