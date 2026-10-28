import type { Candle, Quote, SymbolSpec } from '@levlr/broker-core';
import { CTRADER_TRENDBAR_PERIOD, MINUTE_MS, PRICE_SCALE } from '../constants/ctrader.constants';
import type {
  CTraderKnownSymbol,
  CTraderRawLightSymbol,
  CTraderRawSpotEvent,
  CTraderRawSymbol,
  CTraderRawTrendbar,
} from '../interfaces';

const FOREX_NAME_LENGTH = 6;
const RESOLUTION_TO_PERIOD: Record<string, number> = {
  '1': CTRADER_TRENDBAR_PERIOD.M1,
  '2': CTRADER_TRENDBAR_PERIOD.M2,
  '3': CTRADER_TRENDBAR_PERIOD.M3,
  '4': CTRADER_TRENDBAR_PERIOD.M4,
  '5': CTRADER_TRENDBAR_PERIOD.M5,
  '10': CTRADER_TRENDBAR_PERIOD.M10,
  '15': CTRADER_TRENDBAR_PERIOD.M15,
  '30': CTRADER_TRENDBAR_PERIOD.M30,
  '60': CTRADER_TRENDBAR_PERIOD.H1,
  '240': CTRADER_TRENDBAR_PERIOD.H4,
  '720': CTRADER_TRENDBAR_PERIOD.H12,
  D: CTRADER_TRENDBAR_PERIOD.D1,
  W: CTRADER_TRENDBAR_PERIOD.W1,
  M: CTRADER_TRENDBAR_PERIOD.MN1,
};

export class CTraderMarketMapper {
  static toPeriod(resolution: string): number | null {
    return RESOLUTION_TO_PERIOD[resolution] ?? null;
  }

  static toPrice(raw: number): number {
    return raw / PRICE_SCALE;
  }

  static toSymbolSpec(light: CTraderRawLightSymbol, detail: CTraderRawSymbol): SymbolSpec {
    const name = light.symbolName ?? String(light.symbolId);
    const isPair = name.length === FOREX_NAME_LENGTH;
    return {
      symbol: name,
      digits: detail.digits,
      pipSize: 10 ** -detail.pipPosition,
      contractSize: detail.lotSize / 100,
      lotSize: detail.lotSize / 100,
      minVolume: detail.minVolume / detail.lotSize,
      maxVolume: detail.maxVolume / detail.lotSize,
      stepVolume: detail.stepVolume / detail.lotSize,
      baseCurrency: isPair ? name.slice(0, 3) : '',
      quoteCurrency: isPair ? name.slice(3) : '',
    };
  }

  static toKnownSymbol(light: CTraderRawLightSymbol, detail: CTraderRawSymbol): CTraderKnownSymbol {
    return { symbolId: light.symbolId, name: light.symbolName ?? String(light.symbolId), lotSizeCents: detail.lotSize };
  }

  static toCandle(raw: CTraderRawTrendbar): Candle {
    const low = CTraderMarketMapper.toPrice(raw.low);
    return {
      time: raw.utcTimestampInMinutes * MINUTE_MS,
      open: CTraderMarketMapper.toPrice(raw.low + raw.deltaOpen),
      high: CTraderMarketMapper.toPrice(raw.low + raw.deltaHigh),
      low,
      close: CTraderMarketMapper.toPrice(raw.low + raw.deltaClose),
      volume: raw.volume,
    };
  }

  static toQuote(raw: CTraderRawSpotEvent, symbol: string, previous?: Quote): Quote {
    return {
      symbol,
      bid: raw.bid !== undefined ? CTraderMarketMapper.toPrice(raw.bid) : (previous?.bid ?? 0),
      ask: raw.ask !== undefined ? CTraderMarketMapper.toPrice(raw.ask) : (previous?.ask ?? 0),
      time: raw.timestamp ?? Date.now(),
    };
  }
}
