import { useMemo } from 'react';
import type { ChartOverlay } from '@/features/chart/types/chart';
import { ChartOverlayMapper } from '@/features/trading/mappers/chartOverlay.mapper';
import { useTradingStore } from '@/features/trading/stores/tradingStore';

export function useChartOverlays(symbol: string): ChartOverlay[] {
  const positions = useTradingStore((state) => state.positions);
  const orders = useTradingStore((state) => state.orders);

  return useMemo(() => ChartOverlayMapper.forSymbol(symbol, positions, orders), [symbol, positions, orders]);
}
