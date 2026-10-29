import { useEffect, useRef } from 'react';
import { LightweightChartAdapter } from '@/features/chart/adapters/LightweightChartAdapter';
import type {
  ChartBar,
  ChartDataFeed,
  ChartIndicatorId,
  ChartLevel,
  ChartOverlay,
  ChartPeriod,
  ChartSymbol,
} from '@/features/chart/types/chart';
import { cn } from '@/lib/utils';
import type { ResolvedTheme } from '@/types/theme';

interface ChartViewProps {
  feed: ChartDataFeed;
  symbol: ChartSymbol;
  period: ChartPeriod;
  theme: ResolvedTheme;
  indicators: ChartIndicatorId[];
  overlays: ChartOverlay[];
  levels: ChartLevel[];
  drawMode: boolean;
  onLevelDrawn: (price: number) => void;
  onBarsChange: (bars: ChartBar[]) => void;
}

export function ChartView({
  feed,
  symbol,
  period,
  theme,
  indicators,
  overlays,
  levels,
  drawMode,
  onLevelDrawn,
  onBarsChange,
}: ChartViewProps) {
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
    adapterRef.current?.setBarsListener(onBarsChange);
  }, [onBarsChange, feed]);

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

  useEffect(() => {
    adapterRef.current?.setLevels(levels);
  }, [levels, feed]);

  useEffect(() => {
    adapterRef.current?.setClickHandler(drawMode ? (price) => onLevelDrawn(Number(price.toFixed(symbol.pricePrecision))) : null);
  }, [drawMode, onLevelDrawn, symbol.pricePrecision, feed]);

  return <div ref={containerRef} className={cn('h-full w-full', drawMode && 'cursor-crosshair')} />;
}
