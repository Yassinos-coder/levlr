import { describe, expect, test } from 'bun:test';
import type { BarTuple } from '@/ai/interfaces';
import { LevelTouchUtils } from '@/ai/utils/level-touch.utils';

const bar = (index: number, low: number, high: number, close: number): BarTuple => [index * 3_600_000, close, high, low, close];

describe('LevelTouchUtils', () => {
  test('groups consecutive touching bars into one event', () => {
    const bars = [bar(0, 10, 11, 10.8), bar(1, 11.5, 12, 11.8), bar(2, 11.9, 12.4, 12.2), bar(3, 11.9, 12.3, 12), bar(4, 12.5, 13, 12.8)];
    const report = LevelTouchUtils.analyse(bars, 12, 0.2);
    expect(report.touches).toBe(1);
    expect(report.barsTouching).toBe(3);
  });

  test('counts separate approaches as separate touches and classifies outcome', () => {
    const bars = [bar(0, 10, 11, 10.5), bar(1, 11, 12.1, 11.5), bar(2, 10, 11, 10.5), bar(3, 11.5, 12.2, 12.5), bar(4, 12.4, 13, 12.9)];
    const report = LevelTouchUtils.analyse(bars, 12, 0.05);
    expect(report.touches).toBe(2);
    expect(report.heldCount).toBe(1);
    expect(report.events[0]?.outcome).toBe('held');
  });

  test('returns zero when price never reaches the level', () => {
    const report = LevelTouchUtils.analyse([bar(0, 10, 11, 10.5)], 20, 0.1);
    expect(report.touches).toBe(0);
  });
});
