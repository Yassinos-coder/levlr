import { useEffect, useRef } from 'react';
import { KLineChartAdapter } from '@/features/chart/adapters/KLineChartAdapter';
import type { ChartDataFeed, ChartPeriod, ChartSymbol } from '@/features/chart/types/chart';

interface ChartViewProps {
  feed: ChartDataFeed;
  symbol: ChartSymbol;
  period: ChartPeriod;
}

export function ChartView({ feed, symbol, period }: ChartViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const adapterRef = useRef<KLineChartAdapter | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const adapter = new KLineChartAdapter();
    adapter.mount(container);
    adapter.setDataFeed(feed);
    adapter.setSymbol(symbol);
    adapter.setPeriod(period);
    adapterRef.current = adapter;

    const observer = new ResizeObserver(() => adapter.resize());
    observer.observe(container);

    return () => {
      observer.disconnect();
      adapter.dispose();
      adapterRef.current = null;
    };
  }, [feed, symbol, period]);

  return <div ref={containerRef} className="h-full w-full" />;
}
