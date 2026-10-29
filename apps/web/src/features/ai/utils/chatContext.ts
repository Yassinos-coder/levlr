import type { BrokerOrder, BrokerPosition } from '@levlr/broker-core';
import type { ChartBar, ChartLevel } from '@/features/chart/types/chart';
import { MAX_CONTEXT_BARS } from '@/features/ai/constants/ai';
import type { ChatContext } from '@/features/ai/types/ai';

interface BuildContextInput {
  symbol: string;
  timeframe: string;
  bars: ChartBar[];
  levels: ChartLevel[];
  positions: BrokerPosition[];
  orders: BrokerOrder[];
}

export class ChatContextUtils {
  static build({ symbol, timeframe, bars, levels, positions, orders }: BuildContextInput): ChatContext {
    return {
      symbol,
      timeframe,
      bars: bars.slice(-MAX_CONTEXT_BARS).map((bar) => [bar.timestamp, bar.open, bar.high, bar.low, bar.close]),
      drawings: levels.map((level) => ({ id: level.id, kind: 'level', price: level.price, label: level.label })),
      positions: positions.map((position) => ({
        id: position.id,
        symbol: position.symbol,
        side: position.side,
        volume: position.volume,
        entryPrice: position.entryPrice,
        sl: position.sl,
        tp: position.tp,
      })),
      orders: orders.map((order) => ({
        id: order.id,
        symbol: order.symbol,
        side: order.side,
        type: order.type,
        volume: order.volume,
        price: order.price,
        sl: order.sl,
        tp: order.tp,
      })),
    };
  }
}
