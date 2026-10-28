import type { ChartPeriod, ChartSymbol } from '@/features/chart/types/chart';

export const DEFAULT_SYMBOL: ChartSymbol = { ticker: 'EURUSD', pricePrecision: 5 };
export const DEFAULT_PERIOD: ChartPeriod = { type: 'hour', span: 1 };
