import { expect, test } from 'bun:test';
import type { BrokerOrder, BrokerPosition } from '@levlr/broker-core';
import { ChartOverlayMapper } from './chartOverlay.mapper';

const position: BrokerPosition = {
  id: '1',
  symbol: 'EURUSD',
  side: 'sell',
  volume: 0.03,
  entryPrice: 1.1,
  sl: 1.105,
  tp: 1.09,
  openedAt: 0,
  swap: 0,
  commission: 0,
};

const order: BrokerOrder = { id: '2', symbol: 'EURUSD', side: 'buy', type: 'limit', volume: 0.1, price: 1.08, createdAt: 0 };

test('a position yields entry, stop loss and take profit lines', () => {
  const overlays = ChartOverlayMapper.fromPositions([position]);
  expect(overlays.map((overlay) => overlay.kind)).toEqual(['position', 'stopLoss', 'takeProfit']);
  expect(overlays[0]?.label).toBe('SELL 0.03');
});

test('a pending order yields one line at its price', () => {
  const overlays = ChartOverlayMapper.fromOrders([order]);
  expect(overlays).toHaveLength(1);
  expect(overlays[0]?.price).toBe(1.08);
});

test('only the selected symbol is drawn', () => {
  const other: BrokerPosition = { ...position, id: '3', symbol: 'GBPUSD' };
  expect(ChartOverlayMapper.forSymbol('EURUSD', [position, other], [order])).toHaveLength(4);
});
