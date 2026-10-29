import { Injectable, InternalServerErrorException } from '@nestjs/common';
import type { AiSettingsRecord } from '@/ai/interfaces';
import { PrismaService } from '@/prisma/prisma.service';

const FIELDS = {
  enabled: true,
  provider: true,
  model: true,
  methodologyPrompt: true,
  allowPlanTrades: true,
  allowManageTrades: true,
} as const;

@Injectable()
export class AiSettingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async find(userId: string) {
    try {
      return await this.prisma.aiSettings.findUnique({ where: { userId }, select: FIELDS });
    } catch (error) {
      throw new InternalServerErrorException(`Failed to load AI settings: ${AiSettingsRepository.reason(error)}`);
    }
  }

  async upsert(userId: string, data: AiSettingsRecord) {
    try {
      await this.prisma.profile.upsert({ where: { id: userId }, update: {}, create: { id: userId } });
      return await this.prisma.aiSettings.upsert({
        where: { userId },
        update: data,
        create: { userId, ...data },
        select: FIELDS,
      });
    } catch (error) {
      throw new InternalServerErrorException(`Failed to save AI settings: ${AiSettingsRepository.reason(error)}`);
    }
  }

  private static reason(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
