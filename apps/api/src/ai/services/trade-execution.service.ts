import { BadRequestException, Injectable } from '@nestjs/common';
import type { BrokerAdapter } from '@levlr/broker-core';
import type {
  ClosePositionPayload,
  ModifyPositionPayload,
  OrderProposalPayload,
  ProposalKind,
  ProposalPayload,
  SizingInput,
} from '@/ai/interfaces';
import { RiskSettingsRepository } from '@/ai/repositories/risk-settings.repository';
import { ProposalSizingUtils } from '@/ai/utils/proposal-sizing.utils';
import { BrokerSessionService } from '@/brokers/ctrader/services/broker-session.service';

interface ExecuteInput {
  userId: string;
  connectionId: string;
  proposalId: string;
  kind: ProposalKind;
  payload: ProposalPayload;
  sizing: SizingInput;
}

@Injectable()
export class TradeExecutionService {
  constructor(
    private readonly sessions: BrokerSessionService,
    private readonly risk: RiskSettingsRepository,
  ) {}

  async execute(input: ExecuteInput): Promise<Record<string, unknown>> {
    const { adapter } = await this.sessions.open(input.userId, input.connectionId);
    try {
      if (input.kind === 'order') return await this.placeOrder(adapter, input);
      if (input.kind === 'close') return await this.closePosition(adapter, input.payload as ClosePositionPayload);
      return await this.modifyPosition(adapter, input.payload as ModifyPositionPayload);
    } finally {
      await adapter.disconnect().catch(() => undefined);
    }
  }

  private async placeOrder(adapter: BrokerAdapter, input: ExecuteInput) {
    const payload = input.payload as OrderProposalPayload;
    const [specs, account, maxRiskPct] = await Promise.all([
      adapter.getSymbols(),
      adapter.getAccount(),
      this.risk.findMaxRiskPct(input.userId),
    ]);
    const sizing: SizingInput = input.sizing.lots !== undefined || input.sizing.riskPct !== undefined
      ? input.sizing
      : { lots: payload.lots, riskPct: payload.riskPct };

    const size = ProposalSizingUtils.resolve({
      entry: payload.entry,
      sl: payload.sl,
      sizing,
      spec: specs.find((spec) => spec.symbol === payload.symbol),
      account,
      maxRiskPct,
    });

    const result = await adapter.placeOrder({
      idempotencyKey: input.proposalId,
      symbol: payload.symbol,
      side: payload.side,
      type: payload.type,
      volume: size.lots,
      price: payload.entry,
      sl: payload.sl,
      tp: payload.tp,
    });
    return { orderId: result.orderId, lots: size.lots, riskPct: size.riskPct, riskAmount: size.riskAmount };
  }

  private async closePosition(adapter: BrokerAdapter, payload: ClosePositionPayload) {
    await this.assertPositionExists(adapter, payload.positionId);
    await adapter.closePosition(payload.positionId, payload.volume);
    return { positionId: payload.positionId };
  }

  private async modifyPosition(adapter: BrokerAdapter, payload: ModifyPositionPayload) {
    await this.assertPositionExists(adapter, payload.positionId);
    await adapter.modifyPosition(payload.positionId, payload.sl, payload.tp);
    return { positionId: payload.positionId };
  }

  private async assertPositionExists(adapter: BrokerAdapter, positionId: string) {
    const snapshot = await adapter.reconcile();
    if (!snapshot.positions.some((position) => position.id === positionId)) {
      throw new BadRequestException('That position is no longer open');
    }
  }
}
