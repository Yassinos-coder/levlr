import { Minus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Toggle } from '@/components/ui/toggle';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { LevelsMenu } from '@/features/chart/components/LevelsMenu';
import { INDICATORS, TIMEFRAMES } from '@/features/chart/constants/chart';
import type { ChartIndicatorId, ChartLevel } from '@/features/chart/types/chart';

interface ChartToolbarProps {
  ticker: string;
  timeframe: string;
  indicators: ChartIndicatorId[];
  levels: ChartLevel[];
  pricePrecision: number;
  drawMode: boolean;
  demo: boolean;
  onTimeframeChange: (timeframe: string) => void;
  onIndicatorToggle: (indicator: ChartIndicatorId) => void;
  onDrawModeChange: (drawMode: boolean) => void;
  onRemoveLevel: (id: string) => void;
  onClearLevels: () => void;
}

export function ChartToolbar({
  ticker,
  timeframe,
  indicators,
  levels,
  pricePrecision,
  drawMode,
  demo,
  onTimeframeChange,
  onIndicatorToggle,
  onDrawModeChange,
  onRemoveLevel,
  onClearLevels,
}: ChartToolbarProps) {
  return (
    <div className="flex h-10 shrink-0 items-center gap-3 border-b px-3">
      <span className="font-mono text-sm font-semibold tracking-tight">{ticker}</span>
      <ToggleGroup
        type="single"
        size="sm"
        value={timeframe}
        onValueChange={(value) => value && onTimeframeChange(value)}
        aria-label="Timeframe"
      >
        {TIMEFRAMES.map((item) => (
          <ToggleGroupItem key={item.value} value={item.value} className="px-2 font-mono text-xs">
            {item.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <div className="mx-1 h-4 w-px bg-border" />
      <div className="flex items-center gap-1">
        {INDICATORS.map((item) => (
          <Toggle
            key={item.id}
            size="sm"
            pressed={indicators.includes(item.id)}
            onPressedChange={() => onIndicatorToggle(item.id)}
            className="px-2 text-xs"
          >
            {item.label}
          </Toggle>
        ))}
      </div>
      <div className="mx-1 h-4 w-px bg-border" />
      <div className="flex items-center gap-1">
        <Toggle size="sm" pressed={drawMode} onPressedChange={onDrawModeChange} className="gap-1 px-2 text-xs">
          <Minus /> {drawMode ? 'Click the chart…' : 'Draw level'}
        </Toggle>
        <LevelsMenu levels={levels} precision={pricePrecision} onRemove={onRemoveLevel} onClear={onClearLevels} />
      </div>
      {demo && (
        <Badge variant="outline" className="ml-auto border-warn/40 text-warn">
          Demo data
        </Badge>
      )}
    </div>
  );
}
