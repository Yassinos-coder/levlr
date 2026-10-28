import { Badge } from '@/components/ui/badge';
import { Toggle } from '@/components/ui/toggle';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { INDICATORS, TIMEFRAMES } from '@/features/chart/constants/chart';
import type { ChartIndicatorId } from '@/features/chart/types/chart';

interface ChartToolbarProps {
  ticker: string;
  timeframe: string;
  indicators: ChartIndicatorId[];
  demo: boolean;
  onTimeframeChange: (timeframe: string) => void;
  onIndicatorToggle: (indicator: ChartIndicatorId) => void;
}

export function ChartToolbar({ ticker, timeframe, indicators, demo, onTimeframeChange, onIndicatorToggle }: ChartToolbarProps) {
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
      {demo && (
        <Badge variant="outline" className="ml-auto border-warn/40 text-warn">
          Demo data
        </Badge>
      )}
    </div>
  );
}
