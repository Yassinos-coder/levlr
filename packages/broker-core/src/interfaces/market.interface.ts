export type Unsubscribe = () => void;

export interface SymbolSpec {
  symbol: string;
  digits: number;
  pipSize: number;
  contractSize: number;
  lotSize: number;
  minVolume: number;
  maxVolume: number;
  stepVolume: number;
  quoteCurrency: string;
  baseCurrency: string;
}

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface CandleRequest {
  symbol: string;
  resolution: string;
  from: number;
  to: number;
}

export interface Quote {
  symbol: string;
  bid: number;
  ask: number;
  time: number;
}

export interface OrderBookLevel {
  price: number;
  volume: number;
}

export interface OrderBook {
  symbol: string;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
}
