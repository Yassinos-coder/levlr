import { Module } from '@nestjs/common';
import { AiKeysModule } from '@/ai-keys/ai-keys.module';
import { AiChatController } from '@/ai/controllers/ai-chat.controller';
import { AiProposalsController } from '@/ai/controllers/ai-proposals.controller';
import { AiSettingsController } from '@/ai/controllers/ai-settings.controller';
import { AiProposalRepository } from '@/ai/repositories/ai-proposal.repository';
import { AiSettingsRepository } from '@/ai/repositories/ai-settings.repository';
import { RiskSettingsRepository } from '@/ai/repositories/risk-settings.repository';
import { AiChatService } from '@/ai/services/ai-chat.service';
import { AiProposalsService } from '@/ai/services/ai-proposals.service';
import { AiSettingsService } from '@/ai/services/ai-settings.service';
import { AiToolRunnerService } from '@/ai/services/ai-tool-runner.service';
import { TradeExecutionService } from '@/ai/services/trade-execution.service';
import { BrokersModule } from '@/brokers/brokers.module';

@Module({
  imports: [AiKeysModule, BrokersModule],
  controllers: [AiSettingsController, AiChatController, AiProposalsController],
  providers: [
    AiSettingsService,
    AiChatService,
    AiProposalsService,
    AiToolRunnerService,
    TradeExecutionService,
    AiSettingsRepository,
    AiProposalRepository,
    RiskSettingsRepository,
  ],
})
export class AiModule {}
