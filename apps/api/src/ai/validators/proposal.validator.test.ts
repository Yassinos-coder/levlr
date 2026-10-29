import { describe, expect, test } from 'bun:test';
import type { OrderProposalPayload } from '@/ai/interfaces';
import { ProposalValidator } from '@/ai/validators/proposal.validator';

const order = (overrides: Partial<OrderProposalPayload>): OrderProposalPayload => ({
  symbol: 'EURUSD',
  side: 'sell',
  type: 'limit',
  entry: 1.11,
  sl: 1.115,
  tp: 1.1,
  rationale: 'test',
  ...overrides,
});

describe('ProposalValidator', () => {
  test('accepts a sell limit above price with sl above and tp below', () => {
    expect(() => ProposalValidator.assertOrder(order({}), 1.105)).not.toThrow();
  });

  test('rejects a sell limit below the current price', () => {
    expect(() => ProposalValidator.assertOrder(order({ entry: 1.1, sl: 1.105, tp: 1.09 }), 1.105)).toThrow();
  });

  test('accepts a buy stop above price', () => {
    expect(() => ProposalValidator.assertOrder(order({ side: 'buy', type: 'stop', entry: 1.11, sl: 1.105, tp: 1.12 }), 1.1)).not.toThrow();
  });

  test('rejects stop loss on the wrong side', () => {
    expect(() => ProposalValidator.assertOrder(order({ sl: 1.1 }), 1.105)).toThrow();
  });
});
