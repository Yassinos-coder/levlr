import { Injectable, InternalServerErrorException } from '@nestjs/common';
import type {
  BrokerConnectionRow,
  BrokerConnectionSecretRow,
  UpsertBrokerConnectionInput,
} from '@/brokers/ctrader/interfaces';
import { PrismaService } from '@/prisma/prisma.service';

const PUBLIC_FIELDS = {
  id: true,
  broker: true,
  environment: true,
  externalAccountId: true,
  accountLabel: true,
  status: true,
  lastSyncAt: true,
  createdAt: true,
} as const;

@Injectable()
export class BrokerConnectionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUser(userId: string): Promise<BrokerConnectionRow[]> {
    try {
      return await this.prisma.brokerConnection.findMany({
        where: { userId },
        select: PUBLIC_FIELDS,
        orderBy: { createdAt: 'asc' },
      });
    } catch (error) {
      throw new InternalServerErrorException(`Failed to load broker connections: ${BrokerConnectionRepository.reason(error)}`);
    }
  }

  async findSecretById(userId: string, id: string): Promise<BrokerConnectionSecretRow | null> {
    try {
      return await this.prisma.brokerConnection.findFirst({
        where: { id, userId },
        select: { id: true, environment: true, externalAccountId: true, secretRef: true },
      });
    } catch (error) {
      throw new InternalServerErrorException(`Failed to load broker connection: ${BrokerConnectionRepository.reason(error)}`);
    }
  }

  async findPreferredId(userId: string): Promise<{ id: string; environment: string } | null> {
    try {
      return await this.prisma.brokerConnection.findFirst({
        where: { userId, status: 'connected' },
        select: { id: true, environment: true },
        orderBy: [{ environment: 'asc' }, { createdAt: 'asc' }],
      });
    } catch (error) {
      throw new InternalServerErrorException(`Failed to load broker connection: ${BrokerConnectionRepository.reason(error)}`);
    }
  }

  async updateSecret(id: string, secretRef: string): Promise<void> {
    try {
      await this.prisma.brokerConnection.update({ where: { id }, data: { secretRef } });
    } catch (error) {
      throw new InternalServerErrorException(`Failed to update broker tokens: ${BrokerConnectionRepository.reason(error)}`);
    }
  }

  async upsert(input: UpsertBrokerConnectionInput): Promise<void> {
    try {
      await this.prisma.profile.upsert({ where: { id: input.userId }, update: {}, create: { id: input.userId } });
      await this.prisma.brokerConnection.upsert({
        where: {
          userId_broker_externalAccountId: {
            userId: input.userId,
            broker: input.broker,
            externalAccountId: input.externalAccountId,
          },
        },
        update: {
          environment: input.environment,
          accountLabel: input.accountLabel,
          secretRef: input.secretRef,
          status: 'connected',
        },
        create: {
          userId: input.userId,
          broker: input.broker,
          environment: input.environment,
          externalAccountId: input.externalAccountId,
          accountLabel: input.accountLabel,
          secretRef: input.secretRef,
          status: 'connected',
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(`Failed to save broker connection: ${BrokerConnectionRepository.reason(error)}`);
    }
  }

  private static reason(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
