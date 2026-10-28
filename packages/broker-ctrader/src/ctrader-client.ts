import { CTRADER_PAYLOAD_TYPE } from '@/constants/ctrader.constants';
import type { CTraderConnection } from '@/ctrader-connection';
import { CTraderUnitsUtils } from '@/ctrader-units.utils';
import type { CTraderAppConfig, CTraderMessage, CTraderNewOrderParams } from '@/interfaces';

export class CTraderClient {
  constructor(
    private readonly connection: CTraderConnection,
    private readonly ctidTraderAccountId: number,
  ) {}

  static authenticateApplication(connection: CTraderConnection, config: CTraderAppConfig) {
    return connection.request(CTRADER_PAYLOAD_TYPE.APPLICATION_AUTH_REQ, {
      clientId: config.clientId,
      clientSecret: config.clientSecret,
    });
  }

  authenticateAccount(accessToken: string) {
    return this.send(CTRADER_PAYLOAD_TYPE.ACCOUNT_AUTH_REQ, { accessToken });
  }

  getTrader() {
    return this.send(CTRADER_PAYLOAD_TYPE.TRADER_REQ, {});
  }

  getSymbols() {
    return this.send(CTRADER_PAYLOAD_TYPE.SYMBOLS_LIST_REQ, { includeArchivedSymbols: false });
  }

  getSymbolsById(symbolIds: number[]) {
    return this.send(CTRADER_PAYLOAD_TYPE.SYMBOL_BY_ID_REQ, { symbolId: symbolIds });
  }

  reconcile() {
    return this.send(CTRADER_PAYLOAD_TYPE.RECONCILE_REQ, { returnProtectionOrders: true });
  }

  getTrendbars(symbolId: number, period: number, fromTimestamp: number, toTimestamp: number) {
    return this.send(CTRADER_PAYLOAD_TYPE.GET_TRENDBARS_REQ, { symbolId, period, fromTimestamp, toTimestamp });
  }

  subscribeSpots(symbolIds: number[]) {
    return this.send(CTRADER_PAYLOAD_TYPE.SUBSCRIBE_SPOTS_REQ, { symbolId: symbolIds });
  }

  unsubscribeSpots(symbolIds: number[]) {
    return this.send(CTRADER_PAYLOAD_TYPE.UNSUBSCRIBE_SPOTS_REQ, { symbolId: symbolIds });
  }

  newOrder(params: CTraderNewOrderParams) {
    return this.send(CTRADER_PAYLOAD_TYPE.NEW_ORDER_REQ, {
      symbolId: params.symbolId,
      orderType: params.orderType,
      tradeSide: params.tradeSide,
      volume: CTraderUnitsUtils.unitsToProtocolVolume(params.volumeUnits),
      limitPrice: params.limitPrice,
      stopPrice: params.stopPrice,
      stopLoss: params.stopLoss,
      takeProfit: params.takeProfit,
      clientOrderId: params.clientOrderId,
    });
  }

  cancelOrder(orderId: number) {
    return this.send(CTRADER_PAYLOAD_TYPE.CANCEL_ORDER_REQ, { orderId });
  }

  closePosition(positionId: number, volumeUnits: number) {
    return this.send(CTRADER_PAYLOAD_TYPE.CLOSE_POSITION_REQ, {
      positionId,
      volume: CTraderUnitsUtils.unitsToProtocolVolume(volumeUnits),
    });
  }

  amendPositionSltp(positionId: number, stopLoss?: number, takeProfit?: number) {
    return this.send(CTRADER_PAYLOAD_TYPE.AMEND_POSITION_SLTP_REQ, { positionId, stopLoss, takeProfit });
  }

  private send(payloadType: number, payload: Record<string, unknown>): Promise<CTraderMessage> {
    return this.connection.request(payloadType, { ctidTraderAccountId: this.ctidTraderAccountId, ...payload });
  }
}
