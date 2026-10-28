import type {
  AccountInfo,
  AccountSnapshot,
  BrokerAdapter,
  BrokerCredentials,
  Candle,
  CandleRequest,
  ExecutionEvent,
  OrderChanges,
  OrderRequest,
  OrderResult,
  Quote,
  SymbolSpec,
  Unsubscribe,
} from '@levlr/broker-core';
import { CTRADER_ORDER_TYPE, CTRADER_PAYLOAD_TYPE, CTRADER_TRADE_SIDE } from './constants/ctrader.constants';
import { CTraderClient } from './ctrader-client';
import { CTraderConnection } from './ctrader-connection';
import { CTraderError } from './ctrader-error';
import { CTraderUnitsUtils } from './ctrader-units.utils';
import { CTraderAccountMapper } from './mappers/ctrader-account.mapper';
import { CTraderExecutionMapper } from './mappers/ctrader-execution.mapper';
import { CTraderMarketMapper } from './mappers/ctrader-market.mapper';
import type {
  CTraderAppConfig,
  CTraderKnownSymbol,
  CTraderMessage,
  CTraderRawExecutionEvent,
  CTraderRawLightSymbol,
  CTraderRawOrder,
  CTraderRawPosition,
  CTraderRawSpotEvent,
  CTraderRawSymbol,
  CTraderRawTrader,
  CTraderRawTrendbar,
} from './interfaces';

export class CTraderAdapter implements BrokerAdapter {
  readonly id = 'ctrader' as const;

  private connection: CTraderConnection | null = null;
  private client: CTraderClient | null = null;
  private currency = '';
  private readonly symbolsByName = new Map<string, CTraderKnownSymbol>();
  private readonly symbolsById = new Map<number, CTraderKnownSymbol>();
  private readonly specs = new Map<string, SymbolSpec>();
  private readonly quoteCallbacks = new Map<number, Set<(quote: Quote) => void>>();
  private readonly lastQuotes = new Map<number, Quote>();
  private readonly executionCallbacks = new Set<(event: ExecutionEvent) => void>();

  constructor(private readonly app: CTraderAppConfig) {}

  async connect(credentials: BrokerCredentials): Promise<void> {
    const connection = new CTraderConnection();
    await connection.connect(credentials.environment);
    connection.onEvent((message) => this.handleEvent(message));

    await CTraderClient.authenticateApplication(connection, this.app);
    const client = new CTraderClient(connection, Number(credentials.accountId));
    await client.authenticateAccount(credentials.accessToken);

    this.connection = connection;
    this.client = client;
    await this.loadSymbols();
    await this.loadCurrency();
  }

  async disconnect(): Promise<void> {
    this.connection?.close();
    this.connection = null;
    this.client = null;
  }

  async reconcile(): Promise<AccountSnapshot> {
    const response = await this.requireClient().reconcile();
    const payload = response.payload as { position?: CTraderRawPosition[]; order?: CTraderRawOrder[] };

    return {
      account: await this.getAccount(),
      positions: this.mapKnown(payload.position ?? [], (raw) => raw.tradeData.symbolId, CTraderAccountMapper.toPosition),
      orders: this.mapKnown(payload.order ?? [], (raw) => raw.tradeData.symbolId, CTraderAccountMapper.toOrder),
    };
  }

  async getSymbols(): Promise<SymbolSpec[]> {
    return [...this.specs.values()];
  }

  async getCandles(req: CandleRequest): Promise<Candle[]> {
    const symbol = this.requireSymbol(req.symbol);
    const period = CTraderMarketMapper.toPeriod(req.resolution);
    if (period === null) throw new CTraderError(`Unsupported resolution ${req.resolution}`);

    const response = await this.requireClient().getTrendbars(symbol.symbolId, period, req.from, req.to);
    const bars = (response.payload as { trendbar?: CTraderRawTrendbar[] }).trendbar ?? [];
    return bars.map(CTraderMarketMapper.toCandle);
  }

  subscribeQuotes(symbols: string[], cb: (q: Quote) => void): Unsubscribe {
    const ids = symbols.map((name) => this.requireSymbol(name).symbolId);
    ids.forEach((id) => {
      const callbacks = this.quoteCallbacks.get(id) ?? new Set();
      callbacks.add(cb);
      this.quoteCallbacks.set(id, callbacks);
    });
    this.requireClient().subscribeSpots(ids).catch(() => undefined);

    return () => {
      ids.forEach((id) => this.quoteCallbacks.get(id)?.delete(cb));
      const unused = ids.filter((id) => !this.quoteCallbacks.get(id)?.size);
      if (unused.length > 0) this.client?.unsubscribeSpots(unused).catch(() => undefined);
    };
  }

  async getAccount(): Promise<AccountInfo> {
    const response = await this.requireClient().getTrader();
    const trader = (response.payload as { trader: CTraderRawTrader }).trader;
    return CTraderAccountMapper.toAccountInfo(trader, this.currency);
  }

  async placeOrder(req: OrderRequest): Promise<OrderResult> {
    const symbol = this.requireSymbol(req.symbol);
    const response = await this.requireClient().newOrder({
      symbolId: symbol.symbolId,
      orderType: CTraderAdapter.toOrderType(req.type),
      tradeSide: req.side === 'buy' ? CTRADER_TRADE_SIDE.BUY : CTRADER_TRADE_SIDE.SELL,
      volumeUnits: CTraderUnitsUtils.lotsToUnits(req.volume, symbol.lotSizeCents),
      limitPrice: req.type === 'limit' ? req.price : undefined,
      stopPrice: req.type === 'stop' ? req.price : undefined,
      stopLoss: req.sl,
      takeProfit: req.tp,
      clientOrderId: req.idempotencyKey,
    });

    const event = response.payload as unknown as CTraderRawExecutionEvent;
    return {
      orderId: event.order ? String(event.order.orderId) : '',
      positionId: event.position ? String(event.position.positionId) : undefined,
      fillPrice: event.deal?.executionPrice,
    };
  }

  async modifyOrder(id: string, changes: OrderChanges): Promise<void> {
    await this.requireConnection().request(CTRADER_PAYLOAD_TYPE.AMEND_ORDER_REQ, {
      ctidTraderAccountId: this.requireClient().accountId,
      orderId: Number(id),
      volume: changes.volume,
      limitPrice: changes.price,
      stopLoss: changes.sl,
      takeProfit: changes.tp,
    });
  }

  async cancelOrder(id: string): Promise<void> {
    await this.requireClient().cancelOrder(Number(id));
  }

  async closePosition(id: string, volume?: number): Promise<void> {
    const position = await this.findPosition(id);
    const lots = volume ?? position.volume;
    const symbol = this.requireSymbol(position.symbol);
    await this.requireClient().closePosition(Number(id), CTraderUnitsUtils.lotsToUnits(lots, symbol.lotSizeCents));
  }

  async modifyPosition(id: string, sl?: number, tp?: number): Promise<void> {
    await this.requireClient().amendPositionSltp(Number(id), sl, tp);
  }

  onExecution(cb: (e: ExecutionEvent) => void): Unsubscribe {
    this.executionCallbacks.add(cb);
    return () => this.executionCallbacks.delete(cb);
  }

  private async loadSymbols() {
    const client = this.requireClient();
    const list = await client.getSymbols();
    const light = (list.payload as { symbol?: CTraderRawLightSymbol[] }).symbol ?? [];
    if (light.length === 0) return;

    const detail = await client.getSymbolsById(light.map((symbol) => symbol.symbolId));
    const details = (detail.payload as { symbol?: CTraderRawSymbol[] }).symbol ?? [];
    const detailsById = new Map(details.map((symbol) => [symbol.symbolId, symbol]));

    light.forEach((lightSymbol) => {
      const full = detailsById.get(lightSymbol.symbolId);
      if (!full || !lightSymbol.symbolName) return;
      const known = CTraderMarketMapper.toKnownSymbol(lightSymbol, full);
      this.symbolsByName.set(known.name, known);
      this.symbolsById.set(known.symbolId, known);
      this.specs.set(known.name, CTraderMarketMapper.toSymbolSpec(lightSymbol, full));
    });
  }

  private async loadCurrency() {
    const client = this.requireClient();
    const trader = (await client.getTrader()).payload as { trader: CTraderRawTrader };
    const assets = (await client.getAssets()).payload as { asset?: { assetId: number; name: string }[] };
    this.currency = assets.asset?.find((asset) => asset.assetId === trader.trader.depositAssetId)?.name ?? '';
  }

  private handleEvent(message: CTraderMessage) {
    if (message.payloadType === CTRADER_PAYLOAD_TYPE.SPOT_EVENT) return this.handleSpot(message.payload as unknown as CTraderRawSpotEvent);
    if (message.payloadType === CTRADER_PAYLOAD_TYPE.EXECUTION_EVENT) return this.handleExecution(message.payload as unknown as CTraderRawExecutionEvent);
  }

  private handleSpot(raw: CTraderRawSpotEvent) {
    const symbol = this.symbolsById.get(raw.symbolId);
    if (!symbol) return;

    const quote = CTraderMarketMapper.toQuote(raw, symbol.name, this.lastQuotes.get(raw.symbolId));
    this.lastQuotes.set(raw.symbolId, quote);
    this.quoteCallbacks.get(raw.symbolId)?.forEach((callback) => callback(quote));
  }

  private handleExecution(raw: CTraderRawExecutionEvent) {
    const symbolId = raw.order?.tradeData.symbolId ?? raw.position?.tradeData.symbolId;
    const event = CTraderExecutionMapper.toEvent(raw, symbolId === undefined ? undefined : this.symbolsById.get(symbolId));
    if (event) this.executionCallbacks.forEach((callback) => callback(event));
  }

  private async findPosition(id: string) {
    const snapshot = await this.reconcile();
    const position = snapshot.positions.find((candidate) => candidate.id === id);
    if (!position) throw new CTraderError(`Position ${id} not found`);
    return position;
  }

  private mapKnown<TRaw, TOut>(
    items: TRaw[],
    symbolIdOf: (item: TRaw) => number,
    map: (item: TRaw, symbol: CTraderKnownSymbol) => TOut,
  ): TOut[] {
    return items.flatMap((item) => {
      const symbol = this.symbolsById.get(symbolIdOf(item));
      return symbol ? [map(item, symbol)] : [];
    });
  }

  private requireClient(): CTraderClient {
    if (!this.client) throw new CTraderError('cTrader adapter is not connected');
    return this.client;
  }

  private requireConnection(): CTraderConnection {
    if (!this.connection) throw new CTraderError('cTrader adapter is not connected');
    return this.connection;
  }

  private requireSymbol(name: string): CTraderKnownSymbol {
    const symbol = this.symbolsByName.get(name);
    if (!symbol) throw new CTraderError(`Unknown symbol ${name}`);
    return symbol;
  }

  private static toOrderType(type: OrderRequest['type']): number {
    if (type === 'limit') return CTRADER_ORDER_TYPE.LIMIT;
    if (type === 'stop') return CTRADER_ORDER_TYPE.STOP;
    return CTRADER_ORDER_TYPE.MARKET;
  }
}
