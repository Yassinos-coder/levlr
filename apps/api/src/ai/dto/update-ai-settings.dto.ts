import { IsBoolean, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { CHAT_PROVIDERS } from '@/ai/constants/ai-chat';
import type { ChatProvider } from '@/ai/interfaces';

export class UpdateAiSettingsDto {
  @IsBoolean()
  enabled!: boolean;

  @IsIn(CHAT_PROVIDERS)
  provider!: ChatProvider;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  model!: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  methodologyPrompt?: string;

  @IsBoolean()
  allowPlanTrades!: boolean;

  @IsBoolean()
  allowManageTrades!: boolean;
}
