import { describe, expect, test } from 'bun:test';
import type { AccountInfo, SymbolSpec } from '@levlr/broker-core';
import { ProposalSizingUtils } from '@/ai/utils/proposal-sizing.utils';

const spec: SymbolSpec = {
  symbol: 'EURUSD',
  digits: 5,
  pipSize: 0.0001,
  contractSize: 100_000,
  lotSize: 100_000,
  minVolume: 0.01,
  maxVolume: 50,
  stepVolume: 0.01,
  baseCurrency: 'EUR',
  quoteCurrency: 'USD',
};
const account: AccountInfo = { balance: 10_000, equity: 10_000, margin: 0, freeMargin: 10_000, currency: 'USD' };
const base = { entry: 1.1, sl: 1.099, spec, account, maxRiskPct: 1 };

describe('ProposalSizingUtils', () => {
  test('sizes by risk percent', () => {
    const size = ProposalSizingUtils.resolve({ ...base, sizing: { riskPct: 1 } });
    expect(size.lots).toBe(1);
    expect(size.riskAmount).toBeCloseTo(100, 5);
  });

  test('computes implied risk for lots', () => {
    const size = ProposalSizingUtils.resolve({ ...base, sizing: { lots: 0.5 } });
    expect(size.riskPct).toBeCloseTo(0.5, 5);
  });

  test('rejects risk above the limit', () => {
    expect(() => ProposalSizingUtils.resolve({ ...base, sizing: { lots: 2 } })).toThrow();
  });

  test('rejects symbols not quoted in the account currency', () => {
    expect(() => ProposalSizingUtils.resolve({ ...base, spec: { ...spec, quoteCurrency: 'JPY' }, sizing: { riskPct: 1 } })).toThrow();
  });

  test('requires a size', () => {
    expect(() => ProposalSizingUtils.resolve({ ...base, sizing: {} })).toThrow();
  });
});
