import { CandlestickSeries, ColorType, createChart, CrosshairMode, HistogramSeries, LineSeries, LineStyle } from 'lightweight-charts';
import type { IChartApi, IPriceLine, ISeriesApi, UTCTimestamp } from 'lightweight-charts';
import { CHART_THEMES, INDICATOR_COLORS, OLDER_BARS_THRESHOLD } from '@/features/chart/constants/chart';
import type {
  ChartAdapter,
  ChartBar,
  ChartDataFeed,
  ChartIndicatorId,
  ChartLevel,
  ChartOverlay,
  ChartPeriod,
  ChartSymbol,
  ChartTheme,
} from '@/features/chart/types/chart';
import { IndicatorUtils } from '@/features/chart/utils/indicators';
import type { IndicatorPoint } from '@/features/chart/utils/indicators';
import type { ResolvedTheme } from '@/types/theme';

const VISIBLE_BARS = 140;
const VOLUME_ALPHA = '55';
const LINE_INDICATORS = ['sma20', 'ema50'] as const;
type LineIndicatorId = (typeof LINE_INDICATORS)[number];

export class LightweightChartAdapter implements ChartAdapter {
  private chart: IChartApi | null = null;
  private candles: ISeriesApi<'Candlestick'> | null = null;
  private volume: ISeriesApi<'Histogram'> | null = null;
  private readonly lines = new Map<LineIndicatorId, ISeriesApi<'Line'>>();
  private priceLines: IPriceLine[] = [];
  private levelLines: IPriceLine[] = [];
  private levels: ChartLevel[] = [];
  private clickHandler: ((price: number) => void) | null = null;
  private barsListener: ((bars: ChartBar[]) => void) | null = null;
  private feed: ChartDataFeed | null = null;
  private symbol: ChartSymbol | null = null;
  private period: ChartPeriod | null = null;
  private bars: ChartBar[] = [];
  private hasMore = false;
  private loading = false;
  private generation = 0;
  private theme: ResolvedTheme = 'dark';
  private indicators = new Set<ChartIndicatorId>();
  private overlays: ChartOverlay[] = [];

  mount(container: HTMLElement, theme: ResolvedTheme) {
    this.theme = theme;
    this.chart = createChart(container, {
      autoSize: true,
      crosshair: { mode: CrosshairMode.Normal },
      timeScale: { timeVisible: true, secondsVisible: false, rightOffset: 6 },
      layout: { fontSize: 11, fontFamily: 'Geist Variable, system-ui, sans-serif', attributionLogo: true },
    });

    this.candles = this.chart.addSeries(CandlestickSeries, { borderVisible: false });
    this.candles.priceScale().applyOptions({ scaleMargins: { top: 0.08, bottom: 0.22 } });

    this.volume = this.chart.addSeries(HistogramSeries, { priceFormat: { type: 'volume' }, priceScaleId: 'volume', lastValueVisible: false, priceLineVisible: false });
    this.volume.priceScale().applyOptions({ scaleMargins: { top: 0.82, bottom: 0 } });

    this.chart.subscribeClick((param) => {
      if (!this.clickHandler || !param.point || !this.candles) return;
      const price = this.candles.coordinateToPrice(param.point.y);
      if (price !== null) this.clickHandler(price);
    });

    this.chart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
      if (range && range.from < OLDER_BARS_THRESHOLD) this.loadOlder();
    });

    this.applyTheme();
  }

  setDataFeed(feed: ChartDataFeed) {
    this.feed = feed;
  }

  load(symbol: ChartSymbol, period: ChartPeriod) {
    this.symbol = symbol;
    this.period = period;
    this.bars = [];
    this.barsListener?.([]);
    this.hasMore = false;
    this.generation += 1;
    this.candles?.applyOptions({ priceFormat: { type: 'price', precision: symbol.pricePrecision, minMove: 10 ** -symbol.pricePrecision } });
    this.loadInitial(this.generation);
  }

  setTheme(theme: ResolvedTheme) {
    this.theme = theme;
    this.applyTheme();
    this.renderData();
    this.renderOverlays();
    this.renderLevels();
  }

  setIndicators(indicators: ChartIndicatorId[]) {
    this.indicators = new Set(indicators);
    this.volume?.applyOptions({ visible: this.indicators.has('volume') });
    LINE_INDICATORS.forEach((id) => this.lineSeries(id).applyOptions({ visible: this.indicators.has(id) }));
    this.renderIndicators();
  }

  setOverlays(overlays: ChartOverlay[]) {
    this.overlays = overlays;
    this.renderOverlays();
  }

  setLevels(levels: ChartLevel[]) {
    this.levels = levels;
    this.renderLevels();
  }

  setClickHandler(handler: ((price: number) => void) | null) {
    this.clickHandler = handler;
  }

  setBarsListener(listener: ((bars: ChartBar[]) => void) | null) {
    this.barsListener = listener;
    if (this.bars.length > 0) listener?.(this.bars);
  }

  dispose() {
    this.generation += 1;
    this.chart?.remove();
    this.chart = null;
    this.candles = null;
    this.volume = null;
    this.lines.clear();
    this.priceLines = [];
    this.levelLines = [];
    this.barsListener = null;
    this.clickHandler = null;
  }

  private async loadInitial(generation: number) {
    const result = await this.fetchBars(null);
    if (!result || generation !== this.generation) return;

    this.bars = result.bars;
    this.hasMore = result.hasMore;
    this.renderData();
    this.chart?.timeScale().setVisibleLogicalRange({ from: this.bars.length - VISIBLE_BARS, to: this.bars.length + 6 });
  }

  private async loadOlder() {
    const oldest = this.bars[0];
    const timeScale = this.chart?.timeScale();
    if (!oldest || !timeScale || !this.hasMore || this.loading) return;

    const generation = this.generation;
    const range = timeScale.getVisibleLogicalRange();
    const result = await this.fetchBars(oldest.timestamp);
    if (!result || generation !== this.generation) return;

    const older = result.bars.filter((bar) => bar.timestamp < oldest.timestamp);
    this.hasMore = result.hasMore && older.length > 0;
    this.bars = [...older, ...this.bars];
    this.renderData();
    if (range) timeScale.setVisibleLogicalRange({ from: range.from + older.length, to: range.to + older.length });
  }

  private async fetchBars(before: number | null) {
    if (!this.feed || !this.symbol || !this.period) return null;

    this.loading = true;
    try {
      return await this.feed.getBars({ ticker: this.symbol.ticker, period: this.period, before });
    } catch {
      return null;
    } finally {
      this.loading = false;
    }
  }

  private renderData() {
    const colors = this.colors;
    this.candles?.setData(
      this.bars.map((bar) => ({ time: LightweightChartAdapter.toTime(bar.timestamp), open: bar.open, high: bar.high, low: bar.low, close: bar.close })),
    );
    this.volume?.setData(
      this.bars.map((bar) => ({
        time: LightweightChartAdapter.toTime(bar.timestamp),
        value: bar.volume,
        color: (bar.close >= bar.open ? colors.up : colors.down) + VOLUME_ALPHA,
      })),
    );
    this.renderIndicators();
    this.barsListener?.(this.bars);
  }

  private renderIndicators() {
    const sources: Record<LineIndicatorId, IndicatorPoint[]> = {
      sma20: IndicatorUtils.sma(this.bars, 20),
      ema50: IndicatorUtils.ema(this.bars, 50),
    };

    LINE_INDICATORS.forEach((id) => {
      const data = this.indicators.has(id) ? sources[id] : [];
      this.lineSeries(id).setData(data.map((point) => ({ time: LightweightChartAdapter.toTime(point.timestamp), value: point.value })));
    });
  }

  private renderOverlays() {
    const candles = this.candles;
    if (!candles) return;

    this.priceLines.forEach((line) => candles.removePriceLine(line));
    this.priceLines = this.overlays.map((overlay) => {
      const color = this.overlayColor(overlay);
      return candles.createPriceLine({
        price: overlay.price,
        color,
        lineWidth: 1,
        lineStyle: overlay.kind === 'position' ? LineStyle.Solid : overlay.kind === 'order' ? LineStyle.Dotted : LineStyle.Dashed,
        axisLabelVisible: true,
        title: overlay.label,
        axisLabelColor: color,
      });
    });
  }

  private renderLevels() {
    const candles = this.candles;
    if (!candles) return;

    this.levelLines.forEach((line) => candles.removePriceLine(line));
    const color = this.colors.warn;
    this.levelLines = this.levels.map((level) =>
      candles.createPriceLine({
        price: level.price,
        color,
        lineWidth: 2,
        lineStyle: LineStyle.LargeDashed,
        axisLabelVisible: true,
        title: level.label,
        axisLabelColor: color,
      }),
    );
  }

  private overlayColor(overlay: ChartOverlay): string {
    const colors = this.colors;
    if (overlay.kind === 'stopLoss') return colors.down;
    if (overlay.kind === 'takeProfit') return colors.up;
    if (overlay.kind === 'order') return colors.accent;
    return overlay.side === 'sell' ? colors.down : colors.up;
  }

  private lineSeries(id: LineIndicatorId): ISeriesApi<'Line'> {
    const existing = this.lines.get(id);
    if (existing) return existing;
    if (!this.chart) throw new Error('Chart is not mounted');

    const series = this.chart.addSeries(LineSeries, { color: INDICATOR_COLORS[id], lineWidth: 2, priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false });
    this.lines.set(id, series);
    return series;
  }

  private applyTheme() {
    const colors = this.colors;
    this.chart?.applyOptions({
      layout: { background: { type: ColorType.Solid, color: 'rgba(0, 0, 0, 0)' }, textColor: colors.text },
      grid: { vertLines: { color: colors.grid }, horzLines: { color: colors.grid } },
      crosshair: {
        vertLine: { color: colors.crosshair, labelBackgroundColor: colors.accent },
        horzLine: { color: colors.crosshair, labelBackgroundColor: colors.accent },
      },
      rightPriceScale: { borderColor: colors.border },
      timeScale: { borderColor: colors.border },
    });
    this.candles?.applyOptions({ upColor: colors.up, downColor: colors.down, wickUpColor: colors.up, wickDownColor: colors.down });
  }

  private get colors(): ChartTheme {
    return CHART_THEMES[this.theme];
  }

  private static toTime(timestamp: number): UTCTimestamp {
    return Math.floor(timestamp / 1000) as UTCTimestamp;
  }
}
