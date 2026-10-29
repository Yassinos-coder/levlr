import { Injectable, InternalServerErrorException } from '@nestjs/common';
import type { Prisma } from '@/generated/prisma/client';
import type { ProposalKind, ProposalPayload, ProposalRow, ProposalStatus } from '@/ai/interfaces';
import { PrismaService } from '@/prisma/prisma.service';

const SELECT = {
  id: true,
  userId: true,
  connectionId: true,
  kind: true,
  payload: true,
  status: true,
  expiresAt: true,
  connection: { select: { environment: true } },
} as const;

interface CreateProposalInput {
  userId: string;
  connectionId: string;
  kind: ProposalKind;
  payload: ProposalPayload;
  expiresAt: Date;
}

@Injectable()
export class AiProposalRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateProposalInput): Promise<ProposalRow> {
    return this.run('save proposal', () =>
      this.prisma.aiTradeProposal.create({
        data: { ...input, payload: input.payload as unknown as Prisma.InputJsonValue },
        select: SELECT,
      }),
    );
  }

  async findOwned(userId: string, id: string): Promise<ProposalRow | null> {
    return this.run('load proposal', () => this.prisma.aiTradeProposal.findFirst({ where: { id, userId }, select: SELECT }));
  }

  async claim(id: string): Promise<boolean> {
    const result = await this.run('claim proposal', () =>
      this.prisma.aiTradeProposal.updateMany({ where: { id, status: 'pending' }, data: { status: 'executing' } }),
    );
    return result.count === 1;
  }

  async setStatus(id: string, status: ProposalStatus, result?: Record<string, unknown>) {
    const resolved = status === 'pending' || status === 'executing' ? undefined : new Date();
    await this.run('update proposal', () =>
      this.prisma.aiTradeProposal.update({
        where: { id },
        data: { status, resolvedAt: resolved, result: result as Prisma.InputJsonValue | undefined },
      }),
    );
  }

  private async run<T>(action: string, query: () => Promise<T>): Promise<T> {
    try {
      return await query();
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException(`Failed to ${action}: ${reason}`);
    }
  }
}
