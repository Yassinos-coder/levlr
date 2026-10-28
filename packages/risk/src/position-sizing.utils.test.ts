import { expect, test } from 'bun:test';
import { PositionSizingUtils } from './position-sizing.utils';

const base = {
  balance: 1000,
  riskPct: 1,
  pipSize: 0.0001,
  pipValuePerLot: 10,
  minVolume: 0.01,
  maxVolume: 100,
  stepVolume: 0.01,
};

test('sizes lots from sl distance and risk percent', () => {
  const result = PositionSizingUtils.calculate({ ...base, entry: 1.1, sl: 1.099 });
  expect(result.lots).toBe(0.1);
  expect(result.riskAmount).toBe(10);
  expect(result.slPips).toBeCloseTo(10);
});

test('flags when minimum lot exceeds risk', () => {
  const result = PositionSizingUtils.calculate({ ...base, balance: 100, entry: 1.1, sl: 1.09 });
  expect(result.minLotExceedsRisk).toBe(true);
  expect(result.lots).toBe(0.01);
});
