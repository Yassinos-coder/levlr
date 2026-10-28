import { expect, test } from 'bun:test';
import { CTraderStateValidator } from './ctrader-state.validator';

test('verifies a signed state and returns the user', () => {
  const token = CTraderStateValidator.sign('user-1', 'secret');
  expect(CTraderStateValidator.verify(token, 'secret').userId).toBe('user-1');
});

test('rejects a state signed with another secret', () => {
  const token = CTraderStateValidator.sign('user-1', 'secret');
  expect(() => CTraderStateValidator.verify(token, 'other')).toThrow();
});

test('rejects a tampered body', () => {
  const [, signature] = CTraderStateValidator.sign('user-1', 'secret').split('.');
  const forged = Buffer.from(JSON.stringify({ userId: 'user-2', nonce: 'x', issuedAt: Date.now() })).toString('base64url');
  expect(() => CTraderStateValidator.verify(`${forged}.${signature}`, 'secret')).toThrow();
});

test('rejects a missing state', () => {
  expect(() => CTraderStateValidator.verify(undefined, 'secret')).toThrow();
});
