import { DEFAULT_TOUCH_TOLERANCE_PCT, MAX_TOUCH_EVENTS_RETURNED } from '@/ai/constants/ai-chat';
import type { BarTuple, TouchEvent, TouchReport } from '@/ai/interfaces';

const TIME = 0;
const HIGH = 2;
const LOW = 3;
const CLOSE = 4;

export class LevelTouchUtils {
  static analyse(bars: BarTuple[], price: number, tolerance?: number): TouchReport {
    const band = tolerance ?? price * (DEFAULT_TOUCH_TOLERANCE_PCT / 100);
    const events: TouchEvent[] = [];
    let barsTouching = 0;
    let start = -1;

    bars.forEach((bar, index) => {
      const touching = bar[LOW] <= price + band && bar[HIGH] >= price - band;
      if (touching) {
        barsTouching += 1;
        if (start === -1) start = index;
      }
      const eventEnds = start !== -1 && (!touching || index === bars.length - 1);
      if (!eventEnds) return;

      const last = touching ? index : index - 1;
      events.push(LevelTouchUtils.toEvent(bars, start, last, price));
      start = -1;
    });

    return {
      price,
      tolerance: band,
      barsAnalysed: bars.length,
      touches: events.length,
      barsTouching,
      heldCount: events.filter((event) => event.outcome === 'held').length,
      brokeCount: events.filter((event) => event.outcome === 'broke').length,
      events: events.slice(-MAX_TOUCH_EVENTS_RETURNED),
    };
  }

  private static toEvent(bars: BarTuple[], first: number, last: number, price: number): TouchEvent {
    const before = bars[first - 1];
    const after = bars[last + 1];
    const approach = before ? (before[CLOSE] > price ? 'from_above' : 'from_below') : 'unknown';
    const sideAfter = after ? (after[CLOSE] > price ? 'from_above' : 'from_below') : 'unknown';
    const outcome = approach === 'unknown' || sideAfter === 'unknown' ? 'unknown' : approach === sideAfter ? 'held' : 'broke';
    return { time: new Date(bars[first]![TIME]).toISOString(), bars: last - first + 1, approach, outcome };
  }
}
