import type { ExecutionEvent, ExecutionEventType } from '@levlr/broker-core';
import { CTRADER_EXECUTION_TYPE } from '../constants/ctrader.constants';
import type { CTraderKnownSymbol, CTraderRawExecutionEvent } from '../interfaces';

export class CTraderExecutionMapper {
  static toEvent(raw: CTraderRawExecutionEvent, symbol: CTraderKnownSymbol | undefined): ExecutionEvent | null {
    const type = CTraderExecutionMapper.toType(raw);
    if (!type) return null;

    const tradeData = raw.order?.tradeData ?? raw.position?.tradeData;
    const lotSize = symbol?.lotSizeCents ?? 0;
    return {
      type,
      orderId: raw.order ? String(raw.order.orderId) : undefined,
      positionId: raw.position ? String(raw.position.positionId) : undefined,
      symbol: symbol?.name ?? '',
      price: raw.deal?.executionPrice,
      volume: raw.deal?.filledVolume && lotSize ? raw.deal.filledVolume / lotSize : undefined,
      reason: raw.errorCode,
      time: tradeData?.openTimestamp ?? Date.now(),
    };
  }

  private static toType(raw: CTraderRawExecutionEvent): ExecutionEventType | null {
    const isClose = Boolean(raw.deal?.closePositionDetail);
    switch (raw.executionType) {
      case CTRADER_EXECUTION_TYPE.ORDER_ACCEPTED:
        return 'order_accepted';
      case CTRADER_EXECUTION_TYPE.ORDER_FILLED:
      case CTRADER_EXECUTION_TYPE.ORDER_PARTIAL_FILL:
        return isClose ? 'position_closed' : 'order_filled';
      case CTRADER_EXECUTION_TYPE.ORDER_REPLACED:
        return 'position_modified';
      case CTRADER_EXECUTION_TYPE.ORDER_CANCELLED:
      case CTRADER_EXECUTION_TYPE.ORDER_EXPIRED:
        return 'order_cancelled';
      case CTRADER_EXECUTION_TYPE.ORDER_REJECTED:
      case CTRADER_EXECUTION_TYPE.ORDER_CANCEL_REJECTED:
        return 'order_rejected';
      default:
        return null;
    }
  }
}
