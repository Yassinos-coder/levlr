import { BadRequestException } from '@nestjs/common';
import type { BarTuple, ChartContext, DrawingInput, OrderInput, PositionInput } from '@/ai/interfaces';

const MAX_TEXT = 64;

export class AiContextValidator {
  static normalize(raw: Partial<ChartContext>): ChartContext {
    const bars = (raw.bars ?? []).filter(AiContextValidator.isBar);
    if (bars.length === 0) throw new BadRequestException('The chart has no candles loaded yet');

    return {
      symbol: String(raw.symbol ?? '').slice(0, MAX_TEXT),
      timeframe: String(raw.timeframe ?? '').slice(0, MAX_TEXT),
      bars,
      drawings: (raw.drawings ?? []).filter(AiContextValidator.isDrawing).map((drawing) => ({
        id: String(drawing.id).slice(0, MAX_TEXT),
        kind: 'level',
        price: drawing.price,
        label: drawing.label ? String(drawing.label).slice(0, MAX_TEXT) : undefined,
      })),
      positions: (raw.positions ?? []).filter(AiContextValidator.isPosition),
      orders: (raw.orders ?? []).filter(AiContextValidator.isOrder),
    };
  }

  private static isBar(value: unknown): value is BarTuple {
    return Array.isArray(value) && value.length === 5 && value.every((item) => Number.isFinite(item));
  }

  private static isDrawing(value: DrawingInput): boolean {
    return Boolean(value) && value.kind === 'level' && Number.isFinite(value.price) && Boolean(value.id);
  }

  private static isPosition(value: PositionInput): boolean {
    return Boolean(value) && Boolean(value.id) && Boolean(value.symbol) && Number.isFinite(value.volume);
  }

  private static isOrder(value: OrderInput): boolean {
    return Boolean(value) && Boolean(value.id) && Boolean(value.symbol) && Number.isFinite(value.volume);
  }
}
