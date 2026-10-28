import type { BrokerOrder, BrokerPosition } from '@levlr/broker-core';
import type { ChartOverlay } from '@/features/chart/types/chart';

export class ChartOverlayMapper {
  static fromPositions(positions: BrokerPosition[]): ChartOverlay[] {
    return positions.flatMap((position) => {
      const label = `${position.side === 'buy' ? 'BUY' : 'SELL'} ${position.volume}`;
      const overlays: ChartOverlay[] = [
        { id: `position-${position.id}`, kind: 'position', price: position.entryPrice, label, side: position.side },
      ];
      if (position.sl !== undefined) overlays.push({ id: `position-${position.id}-sl`, kind: 'stopLoss', price: position.sl, label: 'SL' });
      if (position.tp !== undefined) overlays.push({ id: `position-${position.id}-tp`, kind: 'takeProfit', price: position.tp, label: 'TP' });
      return overlays;
    });
  }

  static fromOrders(orders: BrokerOrder[]): ChartOverlay[] {
    return orders.flatMap((order) => {
      if (order.price === undefined) return [];

      const label = `${order.type.toUpperCase()} ${order.side === 'buy' ? 'BUY' : 'SELL'} ${order.volume}`;
      const overlays: ChartOverlay[] = [{ id: `order-${order.id}`, kind: 'order', price: order.price, label, side: order.side }];
      if (order.sl !== undefined) overlays.push({ id: `order-${order.id}-sl`, kind: 'stopLoss', price: order.sl, label: 'SL' });
      if (order.tp !== undefined) overlays.push({ id: `order-${order.id}-tp`, kind: 'takeProfit', price: order.tp, label: 'TP' });
      return overlays;
    });
  }

  static forSymbol(symbol: string, positions: BrokerPosition[], orders: BrokerOrder[]): ChartOverlay[] {
    return [
      ...ChartOverlayMapper.fromPositions(positions.filter((position) => position.symbol === symbol)),
      ...ChartOverlayMapper.fromOrders(orders.filter((order) => order.symbol === symbol)),
    ];
  }
}
