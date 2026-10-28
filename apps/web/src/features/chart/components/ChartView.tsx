import { useEffect, useRef } from 'react';
import { LightweightChartAdapter } from '@/features/chart/adapters/LightweightChartAdapter';
import type { ChartDataFeed, ChartIndicatorId, ChartOverlay, ChartPeriod, ChartSymbol } from '@/features/chart/types/chart';
import type { ResolvedTheme } from '@/types/theme';

interface ChartViewProps {
  feed: ChartDataFeed;
  symbol: ChartSymbol;
  period: ChartPeriod;
  theme: ResolvedTheme;
  indicators: ChartIndicatorId[];
  overlays: ChartOverlay[];
}

export function ChartView({ feed, symbol, period, theme, indicators, overlays }: ChartViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const adapterRef = useRef<LightweightChartAdapter | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const adapter = new LightweightChartAdapter();
    adapter.mount(container, theme);
    adapter.setDataFeed(feed);
    adapterRef.current = adapter;

    return () => {
      adapter.dispose();
      adapterRef.current = null;
    };
  }, [feed]);

  useEffect(() => {
    adapterRef.current?.load(symbol, period);
  }, [feed, symbol, period]);

  useEffect(() => {
    adapterRef.current?.setTheme(theme);
  }, [theme]);

  useEffect(() => {
    adapterRef.current?.setIndicators(indicators);
  }, [indicators, feed]);

  useEffect(() => {
    adapterRef.current?.setOverlays(overlays);
  }, [overlays, feed]);

  return <div ref={containerRef} className="h-full w-full" />;
}
