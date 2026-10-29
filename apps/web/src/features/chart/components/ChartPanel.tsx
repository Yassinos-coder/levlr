import { useCallback, useMemo, useState } from 'react';
import { ChartToolbar } from '@/features/chart/components/ChartToolbar';
import { ChartView } from '@/features/chart/components/ChartView';
import { DEFAULT_INDICATORS, DEFAULT_PERIOD, DEFAULT_SYMBOL, DEFAULT_TIMEFRAME, TIMEFRAMES } from '@/features/chart/constants/chart';
import { useChartContextStore } from '@/features/chart/stores/chartContextStore';
import { useDrawingStore } from '@/features/chart/stores/drawingStore';
import type { ChartBar, ChartIndicatorId, ChartLevel } from '@/features/chart/types/chart';
import { DemoDataFeed } from '@/features/chart/utils/demoBars';
import { useChartOverlays } from '@/features/trading/hooks/useChartOverlays';
import { useResolvedTheme } from '@/hooks/useResolvedTheme';

const FEED = new DemoDataFeed();
const NO_LEVELS: ChartLevel[] = [];

export function ChartPanel() {
  const theme = useResolvedTheme();
  const overlays = useChartOverlays(DEFAULT_SYMBOL.ticker);
  const [timeframe, setTimeframe] = useState(DEFAULT_TIMEFRAME);
  const [indicators, setIndicators] = useState<ChartIndicatorId[]>(DEFAULT_INDICATORS);

  const levels = useDrawingStore((state) => state.levelsBySymbol[DEFAULT_SYMBOL.ticker]) ?? NO_LEVELS;
  const drawMode = useDrawingStore((state) => state.drawMode);
  const setDrawMode = useDrawingStore((state) => state.setDrawMode);
  const addLevel = useDrawingStore((state) => state.addLevel);
  const removeLevel = useDrawingStore((state) => state.removeLevel);
  const clearLevels = useDrawingStore((state) => state.clearLevels);
  const setSnapshot = useChartContextStore((state) => state.setSnapshot);

  const period = useMemo(() => TIMEFRAMES.find((item) => item.value === timeframe)?.period ?? DEFAULT_PERIOD, [timeframe]);

  const toggleIndicator = useCallback(
    (indicator: ChartIndicatorId) =>
      setIndicators((current) => (current.includes(indicator) ? current.filter((id) => id !== indicator) : [...current, indicator])),
    [],
  );

  const handleLevelDrawn = useCallback((price: number) => addLevel(DEFAULT_SYMBOL.ticker, price), [addLevel]);
  const handleBarsChange = useCallback(
    (bars: ChartBar[]) => setSnapshot(DEFAULT_SYMBOL.ticker, timeframe, bars),
    [setSnapshot, timeframe],
  );

  return (
    <div className="flex h-full flex-col">
      <ChartToolbar
        ticker={DEFAULT_SYMBOL.ticker}
        timeframe={timeframe}
        indicators={indicators}
        levels={levels}
        pricePrecision={DEFAULT_SYMBOL.pricePrecision}
        drawMode={drawMode}
        demo
        onTimeframeChange={setTimeframe}
        onIndicatorToggle={toggleIndicator}
        onDrawModeChange={setDrawMode}
        onRemoveLevel={(id) => removeLevel(DEFAULT_SYMBOL.ticker, id)}
        onClearLevels={() => clearLevels(DEFAULT_SYMBOL.ticker)}
      />
      <div className="min-h-0 flex-1">
        <ChartView
          feed={FEED}
          symbol={DEFAULT_SYMBOL}
          period={period}
          theme={theme}
          indicators={indicators}
          overlays={overlays}
          levels={levels}
          drawMode={drawMode}
          onLevelDrawn={handleLevelDrawn}
          onBarsChange={handleBarsChange}
        />
      </div>
    </div>
  );
}
