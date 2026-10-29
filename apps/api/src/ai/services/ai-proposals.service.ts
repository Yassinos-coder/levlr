import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PROPOSAL_TTL_MS } from '@/ai/constants/ai-chat';
import type {
  ClosePositionPayload,
  ModifyPositionPayload,
  OrderProposalPayload,
  ProposalKind,
  ProposalPayload,
  ProposalSummary,
  SizingInput,
} from '@/ai/interfaces';
import { ProposalMapper } from '@/ai/mappers/proposal.mapper';
import { AiProposalRepository } from '@/ai/repositories/ai-proposal.repository';
import { AiSettingsService } from '@/ai/services/ai-settings.service';
import { TradeExecutionService } from '@/ai/services/trade-execution.service';
import { ProposalValidator } from '@/ai/validators/proposal.validator';
import { BrokerConnectionRepository } from '@/brokers/ctrader/repositories/broker-connection.repository';

@Injectable()
export class AiProposalsService {
  constructor(
    private readonly proposals: AiProposalRepository,
    private readonly connections: BrokerConnectionRepository,
    private readonly settings: AiSettingsService,
    private readonly execution: TradeExecutionService,
    private readonly config: ConfigService,
  ) {}

  async createOrder(userId: string, payload: OrderProposalPayload, lastPrice: number): Promise<ProposalSummary> {
    ProposalValidator.assertOrder(payload, lastPrice);
    ProposalValidator.assertSizing(payload.riskPct, payload.lots);
    return this.create(userId, 'order', payload);
  }

  async createClose(userId: string, payload: ClosePositionPayload): Promise<ProposalSummary> {
    return this.create(userId, 'close', payload);
  }

  async createModify(userId: string, payload: ModifyPositionPayload): Promise<ProposalSummary> {
    if (payload.sl === undefined && payload.tp === undefined) {
      throw new BadRequestException('Provide a new stop loss or take profit');
    }
    return this.create(userId, 'modify', payload);
  }

  async confirm(userId: string, id: string, sizing: SizingInput): Promise<ProposalSummary> {
    const proposal = await this.proposals.findOwned(userId, id);
    if (!proposal) throw new NotFoundException('Proposal not found');
    if (proposal.status !== 'pending') throw new ConflictException(`This proposal is already ${proposal.status}`);
    if (proposal.expiresAt.getTime() < Date.now()) {
      await this.proposals.setStatus(id, 'expired');
      throw new BadRequestException('This proposal expired. Ask the AI to propose it again.');
    }

    await this.assertAllowed(userId, proposal.kind as ProposalKind, proposal.connection.environment);
    if (!(await this.proposals.claim(id))) throw new ConflictException('This proposal is already being processed');

    try {
      const result = await this.execution.execute({
        userId,
        connectionId: proposal.connectionId,
        proposalId: id,
        kind: proposal.kind as ProposalKind,
        payload: proposal.payload as ProposalPayload,
        sizing,
      });
      await this.proposals.setStatus(id, 'confirmed', result);
      return ProposalMapper.toSummary({ ...proposal, status: 'confirmed' });
    } catch (error) {
      const retryable = error instanceof BadRequestException;
      await this.proposals.setStatus(id, retryable ? 'pending' : 'failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async reject(userId: string, id: string): Promise<ProposalSummary> {
    const proposal = await this.proposals.findOwned(userId, id);
    if (!proposal) throw new NotFoundException('Proposal not found');
    if (proposal.status !== 'pending') throw new ConflictException(`This proposal is already ${proposal.status}`);
    await this.proposals.setStatus(id, 'rejected');
    return ProposalMapper.toSummary({ ...proposal, status: 'rejected' });
  }

  private async create(userId: string, kind: ProposalKind, payload: ProposalPayload): Promise<ProposalSummary> {
    const connection = await this.connections.findPreferredId(userId);
    if (!connection) throw new BadRequestException('Connect a broker account before proposing trades');
    const row = await this.proposals.create({
      userId,
      connectionId: connection.id,
      kind,
      payload,
      expiresAt: new Date(Date.now() + PROPOSAL_TTL_MS),
    });
    return ProposalMapper.toSummary(row);
  }

  private async assertAllowed(userId: string, kind: ProposalKind, environment: string) {
    const settings = await this.settings.get(userId);
    const allowed = kind === 'order' ? settings.allowPlanTrades : settings.allowManageTrades;
    if (!settings.enabled || !allowed) throw new ForbiddenException('This kind of action is turned off in Settings → AI');

    const liveEnabled = this.config.get<boolean>('ai.liveTradingEnabled') === true;
    if (environment === 'live' && !liveEnabled) {
      throw new ForbiddenException('AI-confirmed trades on live accounts are not enabled yet. Use a demo account.');
    }
  }
}
