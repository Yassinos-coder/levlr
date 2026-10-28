import { ChartView } from '@/features/chart/components/ChartView';
import { DEFAULT_PERIOD, DEFAULT_SYMBOL } from '@/features/chart/constants/chart';
import { DemoDataFeed } from '@/features/chart/utils/demoBars';

const FEED = new DemoDataFeed();

export function ChartPanel() {
  return (
    <div className="relative h-full">
      <ChartView feed={FEED} symbol={DEFAULT_SYMBOL} period={DEFAULT_PERIOD} />
      <span className="pointer-events-none absolute right-16 top-2 text-xs text-amber-400">DEMO DATA</span>
    </div>
  );
}
