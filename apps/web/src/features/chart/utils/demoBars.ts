import type { ChartBar, ChartBarsRequest, ChartBarsResult, ChartDataFeed, ChartPeriod } from '@/features/chart/types/chart';

const BARS_PER_PAGE = 500;
const MAX_PAGES = 6;
const PERIOD_MS: Record<ChartPeriod['type'], number> = {
  second: 1000,
  minute: 60_000,
  hour: 3_600_000,
  day: 86_400_000,
  week: 604_800_000,
  month: 2_592_000_000,
  year: 31_536_000_000,
};

export class DemoDataFeed implements ChartDataFeed {
  private pages = 0;

  async getBars({ period, before }: ChartBarsRequest): Promise<ChartBarsResult> {
    this.pages = before === null ? 1 : this.pages + 1;
    const step = PERIOD_MS[period.type] * period.span;
    const end = before === null ? Math.floor(Date.now() / step) * step : before - step;
    return { bars: DemoDataFeed.generate(end, step), hasMore: this.pages < MAX_PAGES };
  }

  private static generate(end: number, step: number): ChartBar[] {
    const bars: ChartBar[] = [];
    let close = 1.1 + ((end / step) % 50) * 0.0005;
    for (let index = BARS_PER_PAGE - 1; index >= 0; index--) {
      const open = close;
      close = open + (Math.random() - 0.5) * 0.002;
      const high = Math.max(open, close) + Math.random() * 0.0008;
      const low = Math.min(open, close) - Math.random() * 0.0008;
      bars.push({ timestamp: end - index * step, open, high, low, close, volume: Math.round(Math.random() * 1000) });
    }
    return bars;
  }
}
