import { dispose, init } from 'klinecharts';
import type { Chart } from 'klinecharts';
import type {
  ChartAdapter,
  ChartDataFeed,
  ChartPeriod,
  ChartSymbol,
} from '@/features/chart/types/chart';

export class KLineChartAdapter implements ChartAdapter {
  private chart: Chart | null = null;
  private container: HTMLElement | null = null;

  mount(container: HTMLElement) {
    this.container = container;
    this.chart = init(container, { styles: 'dark' });
    this.chart?.createIndicator({ name: 'MA', paneId: 'candle_pane' }, true);
    this.chart?.createIndicator('VOL');
  }

  setDataFeed(feed: ChartDataFeed) {
    this.chart?.setDataLoader({
      getBars: async ({ type, timestamp, symbol, period, callback }) => {
        if (type === 'forward' || type === 'update') return callback([], false);
        const { bars, hasMore } = await feed.getBars({
          ticker: symbol.ticker,
          period,
          before: type === 'backward' ? timestamp : null,
        });
        callback(bars, { backward: hasMore, forward: false });
      },
    });
  }

  setSymbol(symbol: ChartSymbol) {
    this.chart?.setSymbol(symbol);
  }

  setPeriod(period: ChartPeriod) {
    this.chart?.setPeriod(period);
  }

  resize() {
    this.chart?.resize();
  }

  dispose() {
    if (this.container) dispose(this.container);
    this.chart = null;
    this.container = null;
  }
}
