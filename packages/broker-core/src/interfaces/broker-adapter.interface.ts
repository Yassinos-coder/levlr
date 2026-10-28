import type { AccountInfo, AccountSnapshot, BrokerCredentials } from './account.interface';
import type { Candle, CandleRequest, OrderBook, Quote, SymbolSpec, Unsubscribe } from './market.interface';
import type { ExecutionEvent, OrderChanges, OrderRequest, OrderResult } from './trading.interface';

export type BrokerId = 'ctrader' | 'bybit' | 'oanda' | 'alpaca' | 'ibkr';

export interface BrokerAdapter {
  id: BrokerId;

  connect(credentials: BrokerCredentials): Promise<void>;
  disconnect(): Promise<void>;
  reconcile(): Promise<AccountSnapshot>;

  getSymbols(): Promise<SymbolSpec[]>;
  getCandles(req: CandleRequest): Promise<Candle[]>;
  subscribeQuotes(symbols: string[], cb: (q: Quote) => void): Unsubscribe;
  getOrderBook?(symbol: string): Promise<OrderBook>;

  getAccount(): Promise<AccountInfo>;

  placeOrder(req: OrderRequest): Promise<OrderResult>;
  modifyOrder(id: string, changes: OrderChanges): Promise<void>;
  cancelOrder(id: string): Promise<void>;
  closePosition(id: string, volume?: number): Promise<void>;
  modifyPosition(id: string, sl?: number, tp?: number): Promise<void>;

  onExecution(cb: (e: ExecutionEvent) => void): Unsubscribe;
}
