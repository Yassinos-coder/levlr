import { Injectable, InternalServerErrorException } from '@nestjs/common';
import type { AiProviderKeyRow, UpsertAiProviderKeyInput } from '@/ai-keys/interfaces';
import { PrismaService } from '@/prisma/prisma.service';

const PUBLIC_FIELDS = { provider: true, keyHint: true, updatedAt: true } as const;

@Injectable()
export class AiKeyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUser(userId: string): Promise<AiProviderKeyRow[]> {
    try {
      return await this.prisma.aiProviderKey.findMany({
        where: { userId },
        select: PUBLIC_FIELDS,
        orderBy: { provider: 'asc' },
      });
    } catch (error) {
      throw new InternalServerErrorException(`Failed to load AI keys: ${AiKeyRepository.reason(error)}`);
    }
  }

  async findSecret(userId: string, provider: string): Promise<string | null> {
    try {
      const row = await this.prisma.aiProviderKey.findUnique({
        where: { userId_provider: { userId, provider } },
        select: { secretRef: true },
      });
      return row?.secretRef ?? null;
    } catch (error) {
      throw new InternalServerErrorException(`Failed to load AI key: ${AiKeyRepository.reason(error)}`);
    }
  }

  async upsert(input: UpsertAiProviderKeyInput): Promise<AiProviderKeyRow> {
    try {
      await this.prisma.profile.upsert({ where: { id: input.userId }, update: {}, create: { id: input.userId } });
      return await this.prisma.aiProviderKey.upsert({
        where: { userId_provider: { userId: input.userId, provider: input.provider } },
        update: { secretRef: input.secretRef, keyHint: input.keyHint },
        create: {
          userId: input.userId,
          provider: input.provider,
          secretRef: input.secretRef,
          keyHint: input.keyHint,
        },
        select: PUBLIC_FIELDS,
      });
    } catch (error) {
      throw new InternalServerErrorException(`Failed to save AI key: ${AiKeyRepository.reason(error)}`);
    }
  }

  async delete(userId: string, provider: string): Promise<void> {
    try {
      await this.prisma.aiProviderKey.deleteMany({ where: { userId, provider } });
    } catch (error) {
      throw new InternalServerErrorException(`Failed to delete AI key: ${AiKeyRepository.reason(error)}`);
    }
  }

  private static reason(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
