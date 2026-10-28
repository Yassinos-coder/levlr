import type { ChartIndicatorId, ChartPeriod, ChartSymbol, ChartTheme } from '@/features/chart/types/chart';
import type { ResolvedTheme } from '@/types/theme';

export const DEFAULT_SYMBOL: ChartSymbol = { ticker: 'EURUSD', pricePrecision: 5 };

export const TIMEFRAMES: { value: string; label: string; period: ChartPeriod }[] = [
  { value: '1m', label: '1m', period: { type: 'minute', span: 1 } },
  { value: '5m', label: '5m', period: { type: 'minute', span: 5 } },
  { value: '15m', label: '15m', period: { type: 'minute', span: 15 } },
  { value: '1h', label: '1H', period: { type: 'hour', span: 1 } },
  { value: '4h', label: '4H', period: { type: 'hour', span: 4 } },
  { value: '1d', label: '1D', period: { type: 'day', span: 1 } },
];

export const DEFAULT_TIMEFRAME = '1h';

export const DEFAULT_PERIOD: ChartPeriod = { type: 'hour', span: 1 };

export const INDICATORS: { id: ChartIndicatorId; label: string }[] = [
  { id: 'sma20', label: 'SMA 20' },
  { id: 'ema50', label: 'EMA 50' },
  { id: 'volume', label: 'Volume' },
];

export const DEFAULT_INDICATORS: ChartIndicatorId[] = ['volume', 'ema50'];

export const INDICATOR_COLORS = { sma20: '#f5b041', ema50: '#8b7cf6' } as const;

export const CHART_THEMES: Record<ResolvedTheme, ChartTheme> = {
  dark: {
    text: '#9aa3bd',
    grid: 'rgba(255, 255, 255, 0.045)',
    border: 'rgba(255, 255, 255, 0.09)',
    crosshair: 'rgba(154, 163, 189, 0.55)',
    up: '#2fd8a0',
    down: '#ff6b82',
    accent: '#5ad7ee',
    warn: '#f5c451',
    muted: 'rgba(154, 163, 189, 0.55)',
  },
  light: {
    text: '#5a627d',
    grid: 'rgba(30, 36, 70, 0.06)',
    border: 'rgba(30, 36, 70, 0.12)',
    crosshair: 'rgba(90, 98, 125, 0.6)',
    up: '#0f9f6b',
    down: '#d93a56',
    accent: '#1f7fc4',
    warn: '#c98a10',
    muted: 'rgba(90, 98, 125, 0.6)',
  },
};

export const OLDER_BARS_THRESHOLD = 25;
