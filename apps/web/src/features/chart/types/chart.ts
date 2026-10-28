export type ChartPeriodType = 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';

export interface ChartPeriod {
  type: ChartPeriodType;
  span: number;
}

export type ChartSymbol = {
  ticker: string;
  pricePrecision: number;
};

export type ChartBar = {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export interface ChartBarsRequest {
  ticker: string;
  period: ChartPeriod;
  before: number | null;
}

export interface ChartBarsResult {
  bars: ChartBar[];
  hasMore: boolean;
}

export interface ChartDataFeed {
  getBars(request: ChartBarsRequest): Promise<ChartBarsResult>;
}

export interface ChartAdapter {
  mount(container: HTMLElement): void;
  setDataFeed(feed: ChartDataFeed): void;
  setSymbol(symbol: ChartSymbol): void;
  setPeriod(period: ChartPeriod): void;
  resize(): void;
  dispose(): void;
}
