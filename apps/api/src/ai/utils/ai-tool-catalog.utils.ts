import { MANAGE_TOOLS, PLAN_TOOLS, READ_TOOLS } from '@/ai/constants/ai-tools';
import type { AiSettingsRecord, ToolDefinition } from '@/ai/interfaces';

export class AiToolCatalogUtils {
  static forSettings(settings: AiSettingsRecord): ToolDefinition[] {
    return [
      ...READ_TOOLS,
      ...(settings.allowPlanTrades ? PLAN_TOOLS : []),
      ...(settings.allowManageTrades ? MANAGE_TOOLS : []),
    ];
  }
}
