import { expect, test } from 'bun:test';
import { CTraderOAuthUtils } from '@/ctrader-oauth.utils';
import { CTraderUnitsUtils } from '@/ctrader-units.utils';

test('converts units to protocol volume in cents', () => {
  expect(CTraderUnitsUtils.unitsToProtocolVolume(10)).toBe(1000);
  expect(CTraderUnitsUtils.protocolVolumeToUnits(1000)).toBe(10);
});

test('converts lots using the symbol lot size', () => {
  expect(CTraderUnitsUtils.lotsToUnits(0.03, 10_000_000)).toBeCloseTo(3000);
  expect(CTraderUnitsUtils.unitsToLots(3000, 10_000_000)).toBeCloseTo(0.03);
});

test('builds the authorization url', () => {
  const url = CTraderOAuthUtils.buildAuthorizationUrl(
    { clientId: 'abc', clientSecret: 'x', redirectUri: 'http://localhost:3001/cb' },
    'state1',
  );
  expect(url).toContain('client_id=abc');
  expect(url).toContain('scope=trading');
  expect(url).toContain('state=state1');
});
