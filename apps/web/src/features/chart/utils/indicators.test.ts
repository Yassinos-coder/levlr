import { expect, test } from 'bun:test';
import type { ChartBar } from '../types/chart';
import { IndicatorUtils } from './indicators';

const bars: ChartBar[] = [1, 2, 3, 4, 5].map((close, index) => ({
  timestamp: index * 1000,
  open: close,
  high: close,
  low: close,
  close,
  volume: 1,
}));

test('sma averages the last period closes', () => {
  const points = IndicatorUtils.sma(bars, 3);
  expect(points.map((point) => point.value)).toEqual([2, 3, 4]);
  expect(points[0]?.timestamp).toBe(2000);
});

test('ema seeds with the sma and then smooths', () => {
  const points = IndicatorUtils.ema(bars, 3);
  expect(points[0]?.value).toBe(2);
  expect(points[1]?.value).toBeCloseTo(3);
  expect(points[2]?.value).toBeCloseTo(4);
});

test('returns nothing when there are fewer bars than the period', () => {
  expect(IndicatorUtils.sma(bars, 10)).toEqual([]);
  expect(IndicatorUtils.ema(bars, 10)).toEqual([]);
});
