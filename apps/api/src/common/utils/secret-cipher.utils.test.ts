import { expect, test } from 'bun:test';
import { randomBytes } from 'node:crypto';
import { SecretCipherUtils } from './secret-cipher.utils';

const key = randomBytes(32).toString('base64');

test('round-trips a secret', () => {
  const encrypted = SecretCipherUtils.encrypt('{"accessToken":"abc"}', key);
  expect(encrypted).not.toContain('abc');
  expect(SecretCipherUtils.decrypt(encrypted, key)).toBe('{"accessToken":"abc"}');
});

test('rejects a tampered payload', () => {
  const encrypted = Buffer.from(SecretCipherUtils.encrypt('secret', key), 'base64');
  const last = encrypted.length - 1;
  encrypted.writeUInt8(encrypted.readUInt8(last) ^ 1, last);
  expect(() => SecretCipherUtils.decrypt(encrypted.toString('base64'), key)).toThrow();
});

test('rejects a key of the wrong size', () => {
  expect(() => SecretCipherUtils.encrypt('secret', 'short')).toThrow();
});
