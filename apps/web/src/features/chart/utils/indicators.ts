import type { ChartBar } from '@/features/chart/types/chart';

export interface IndicatorPoint {
  timestamp: number;
  value: number;
}

export class IndicatorUtils {
  static sma(bars: ChartBar[], period: number): IndicatorPoint[] {
    const points: IndicatorPoint[] = [];
    let sum = 0;

    bars.forEach((bar, index) => {
      sum += bar.close;
      const dropped = bars[index - period];
      if (dropped) sum -= dropped.close;
      if (index >= period - 1) points.push({ timestamp: bar.timestamp, value: sum / period });
    });

    return points;
  }

  static ema(bars: ChartBar[], period: number): IndicatorPoint[] {
    const first = bars[period - 1];
    if (!first) return [];

    const multiplier = 2 / (period + 1);
    const seed = bars.slice(0, period).reduce((total, bar) => total + bar.close, 0) / period;
    const points: IndicatorPoint[] = [{ timestamp: first.timestamp, value: seed }];
    let previous = seed;

    for (const bar of bars.slice(period)) {
      previous = (bar.close - previous) * multiplier + previous;
      points.push({ timestamp: bar.timestamp, value: previous });
    }

    return points;
  }
}
