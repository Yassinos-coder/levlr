import { expect, test } from 'bun:test';
import { CTraderExecutionMapper } from './ctrader-execution.mapper';
import { CTraderMarketMapper } from './ctrader-market.mapper';

const symbol = { symbolId: 1, name: 'EURUSD', lotSizeCents: 10_000_000 };

test('maps a trendbar to a candle in milliseconds', () => {
  const candle = CTraderMarketMapper.toCandle({
    volume: 10,
    low: 110000,
    deltaOpen: 50,
    deltaClose: 120,
    deltaHigh: 200,
    utcTimestampInMinutes: 2,
  });
  expect(candle.time).toBe(120_000);
  expect(candle.low).toBeCloseTo(1.1);
  expect(candle.open).toBeCloseTo(1.1005);
  expect(candle.close).toBeCloseTo(1.1012);
  expect(candle.high).toBeCloseTo(1.102);
});

test('keeps the previous side when a spot event carries only one price', () => {
  const previous = { symbol: 'EURUSD', bid: 1.1, ask: 1.1002, time: 1 };
  const quote = CTraderMarketMapper.toQuote({ symbolId: 1, bid: 110010 }, 'EURUSD', previous);
  expect(quote.bid).toBeCloseTo(1.1001);
  expect(quote.ask).toBe(1.1002);
});

test('maps resolutions to trendbar periods', () => {
  expect(CTraderMarketMapper.toPeriod('60')).toBe(9);
  expect(CTraderMarketMapper.toPeriod('D')).toBe(12);
  expect(CTraderMarketMapper.toPeriod('7')).toBeNull();
});

test('maps a closing fill to position_closed with lots', () => {
  const event = CTraderExecutionMapper.toEvent(
    {
      executionType: 3,
      position: { positionId: 9, tradeData: { symbolId: 1, volume: 300_000, tradeSide: 1 }, price: 1.1 },
      deal: { closePositionDetail: {}, executionPrice: 1.1, filledVolume: 300_000 },
    },
    symbol,
  );
  expect(event?.type).toBe('position_closed');
  expect(event?.volume).toBeCloseTo(0.03);
  expect(event?.symbol).toBe('EURUSD');
});
