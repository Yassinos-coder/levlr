import type { ResolvedTheme } from '@/types/theme';

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

export type ChartIndicatorId = 'sma20' | 'ema50' | 'volume';

export type ChartOverlayKind = 'position' | 'order' | 'stopLoss' | 'takeProfit';

export interface ChartOverlay {
  id: string;
  kind: ChartOverlayKind;
  price: number;
  label: string;
  side?: 'buy' | 'sell';
}

export interface ChartTheme {
  text: string;
  grid: string;
  border: string;
  crosshair: string;
  up: string;
  down: string;
  accent: string;
  warn: string;
  muted: string;
}

export interface ChartAdapter {
  mount(container: HTMLElement, theme: ResolvedTheme): void;
  setDataFeed(feed: ChartDataFeed): void;
  load(symbol: ChartSymbol, period: ChartPeriod): void;
  setTheme(theme: ResolvedTheme): void;
  setIndicators(indicators: ChartIndicatorId[]): void;
  setOverlays(overlays: ChartOverlay[]): void;
  dispose(): void;
}
