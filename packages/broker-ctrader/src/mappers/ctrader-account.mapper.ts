import type { AccountInfo, BrokerOrder, BrokerPosition, OrderSide, OrderType } from '@levlr/broker-core';
import { CTRADER_ORDER_TYPE, CTRADER_TRADE_SIDE } from '../constants/ctrader.constants';
import { CTraderMarketMapper } from './ctrader-market.mapper';
import type { CTraderKnownSymbol, CTraderRawOrder, CTraderRawPosition, CTraderRawTrader } from '../interfaces';

const DEFAULT_MONEY_DIGITS = 2;

export class CTraderAccountMapper {
  static toSide(tradeSide: number): OrderSide {
    return tradeSide === CTRADER_TRADE_SIDE.BUY ? 'buy' : 'sell';
  }

  static toOrderType(orderType: number): OrderType {
    if (orderType === CTRADER_ORDER_TYPE.LIMIT) return 'limit';
    if (orderType === CTRADER_ORDER_TYPE.STOP) return 'stop';
    return 'market';
  }

  static toAccountInfo(trader: CTraderRawTrader, currency: string): AccountInfo {
    const balance = trader.balance / 10 ** (trader.moneyDigits ?? DEFAULT_MONEY_DIGITS);
    return { balance, equity: balance, margin: 0, freeMargin: balance, currency };
  }

  static toPosition(raw: CTraderRawPosition, symbol: CTraderKnownSymbol): BrokerPosition {
    const moneyDigits = raw.moneyDigits ?? DEFAULT_MONEY_DIGITS;
    return {
      id: String(raw.positionId),
      symbol: symbol.name,
      side: CTraderAccountMapper.toSide(raw.tradeData.tradeSide),
      volume: raw.tradeData.volume / symbol.lotSizeCents,
      entryPrice: raw.price,
      sl: raw.stopLoss,
      tp: raw.takeProfit,
      openedAt: raw.tradeData.openTimestamp ?? 0,
      swap: (raw.swap ?? 0) / 10 ** moneyDigits,
      commission: (raw.commission ?? 0) / 10 ** moneyDigits,
    };
  }

  static toOrder(raw: CTraderRawOrder, symbol: CTraderKnownSymbol): BrokerOrder {
    return {
      id: String(raw.orderId),
      symbol: symbol.name,
      side: CTraderAccountMapper.toSide(raw.tradeData.tradeSide),
      type: CTraderAccountMapper.toOrderType(raw.orderType),
      volume: raw.tradeData.volume / symbol.lotSizeCents,
      price: raw.limitPrice ?? raw.stopPrice,
      sl: raw.stopLoss,
      tp: raw.takeProfit,
      createdAt: raw.tradeData.openTimestamp ?? raw.utcLastUpdateTimestamp ?? 0,
    };
  }

  static priceFromRaw(raw: number): number {
    return CTraderMarketMapper.toPrice(raw);
  }
}
