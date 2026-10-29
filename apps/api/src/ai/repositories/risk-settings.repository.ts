import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DEFAULT_MAX_RISK_PCT } from '@/ai/constants/ai-chat';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class RiskSettingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMaxRiskPct(userId: string): Promise<number> {
    try {
      const row = await this.prisma.riskSettings.findUnique({ where: { userId }, select: { maxRiskPct: true } });
      return row ? Number(row.maxRiskPct) : DEFAULT_MAX_RISK_PCT;
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException(`Failed to load risk settings: ${reason}`);
    }
  }
}
