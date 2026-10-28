import { useCallback, useMemo, useState } from 'react';
import { ChartToolbar } from '@/features/chart/components/ChartToolbar';
import { ChartView } from '@/features/chart/components/ChartView';
import { DEFAULT_INDICATORS, DEFAULT_PERIOD, DEFAULT_SYMBOL, DEFAULT_TIMEFRAME, TIMEFRAMES } from '@/features/chart/constants/chart';
import type { ChartIndicatorId } from '@/features/chart/types/chart';
import { DemoDataFeed } from '@/features/chart/utils/demoBars';
import { useChartOverlays } from '@/features/trading/hooks/useChartOverlays';
import { useResolvedTheme } from '@/hooks/useResolvedTheme';

const FEED = new DemoDataFeed();

export function ChartPanel() {
  const theme = useResolvedTheme();
  const overlays = useChartOverlays(DEFAULT_SYMBOL.ticker);
  const [timeframe, setTimeframe] = useState(DEFAULT_TIMEFRAME);
  const [indicators, setIndicators] = useState<ChartIndicatorId[]>(DEFAULT_INDICATORS);

  const period = useMemo(() => TIMEFRAMES.find((item) => item.value === timeframe)?.period ?? DEFAULT_PERIOD, [timeframe]);

  const toggleIndicator = useCallback(
    (indicator: ChartIndicatorId) =>
      setIndicators((current) => (current.includes(indicator) ? current.filter((id) => id !== indicator) : [...current, indicator])),
    [],
  );

  return (
    <div className="flex h-full flex-col">
      <ChartToolbar
        ticker={DEFAULT_SYMBOL.ticker}
        timeframe={timeframe}
        indicators={indicators}
        demo
        onTimeframeChange={setTimeframe}
        onIndicatorToggle={toggleIndicator}
      />
      <div className="min-h-0 flex-1">
        <ChartView feed={FEED} symbol={DEFAULT_SYMBOL} period={period} theme={theme} indicators={indicators} overlays={overlays} />
      </div>
    </div>
  );
}
