import { Injectable } from '@nestjs/common';
import { UpdateAiSettingsDto } from '@/ai/dto/update-ai-settings.dto';
import type { AiSettingsRecord } from '@/ai/interfaces';
import { AiSettingsMapper } from '@/ai/mappers/ai-settings.mapper';
import { AiSettingsRepository } from '@/ai/repositories/ai-settings.repository';

@Injectable()
export class AiSettingsService {
  constructor(private readonly settings: AiSettingsRepository) {}

  async get(userId: string): Promise<AiSettingsRecord> {
    return AiSettingsMapper.toRecord(await this.settings.find(userId));
  }

  async update(userId: string, dto: UpdateAiSettingsDto): Promise<AiSettingsRecord> {
    const row = await this.settings.upsert(userId, {
      enabled: dto.enabled,
      provider: dto.provider,
      model: dto.model.trim(),
      methodologyPrompt: dto.methodologyPrompt?.trim() || null,
      allowPlanTrades: dto.allowPlanTrades,
      allowManageTrades: dto.allowManageTrades,
    });
    return AiSettingsMapper.toRecord(row);
  }
}
