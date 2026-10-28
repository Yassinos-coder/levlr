export type OrderSide = 'buy' | 'sell';
export type OrderType = 'market' | 'limit' | 'stop';

export interface OrderRequest {
  idempotencyKey: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  volume: number;
  price?: number;
  sl?: number;
  tp?: number;
}

export interface OrderResult {
  orderId: string;
  positionId?: string;
  fillPrice?: number;
}

export interface OrderChanges {
  price?: number;
  volume?: number;
  sl?: number;
  tp?: number;
}

export type ExecutionEventType =
  | 'order_accepted'
  | 'order_filled'
  | 'order_cancelled'
  | 'order_rejected'
  | 'position_closed'
  | 'position_modified';

export interface ExecutionEvent {
  type: ExecutionEventType;
  orderId?: string;
  positionId?: string;
  symbol: string;
  price?: number;
  volume?: number;
  pnl?: number;
  reason?: string;
  time: number;
}
