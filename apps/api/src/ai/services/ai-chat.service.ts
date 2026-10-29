import { BadGatewayException, BadRequestException, Injectable } from '@nestjs/common';
import { AiKeysService } from '@/ai-keys/services/ai-keys.service';
import { MAX_HISTORY_MESSAGES, MAX_TOOL_ROUNDS } from '@/ai/constants/ai-chat';
import { ChatDto } from '@/ai/dto/chat.dto';
import type { ChartContext, ChatResult, ConversationTurn, ProposalSummary } from '@/ai/interfaces';
import { AiProviderFactory } from '@/ai/providers/ai-provider.factory';
import { AiSettingsService } from '@/ai/services/ai-settings.service';
import { AiToolRunnerService } from '@/ai/services/ai-tool-runner.service';
import { AiPromptUtils } from '@/ai/utils/ai-prompt.utils';
import { AiToolCatalogUtils } from '@/ai/utils/ai-tool-catalog.utils';
import { AiContextValidator } from '@/ai/validators/ai-context.validator';

@Injectable()
export class AiChatService {
  constructor(
    private readonly settingsService: AiSettingsService,
    private readonly keys: AiKeysService,
    private readonly tools: AiToolRunnerService,
  ) {}

  async chat(userId: string, dto: ChatDto): Promise<ChatResult> {
    const settings = await this.settingsService.get(userId);
    if (!settings.enabled) throw new BadRequestException('The AI copilot is turned off. Enable it in Settings → AI.');

    const apiKey = await this.keys.getPlaintext(userId, settings.provider);
    const context = AiContextValidator.normalize(dto.context as unknown as Partial<ChartContext>);
    const turns = AiChatService.toTurns(dto);
    const provider = AiProviderFactory.create(settings.provider);
    const system = AiPromptUtils.build(settings, context);
    const toolDefinitions = AiToolCatalogUtils.forSettings(settings);
    const proposals: ProposalSummary[] = [];

    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const response = await provider.complete({ apiKey, model: settings.model, system, turns, tools: toolDefinitions });
      if (response.toolCalls.length === 0) return { reply: response.text || 'I have nothing to add.', proposals };

      turns.push({ role: 'assistant', text: response.text, toolCalls: response.toolCalls });
      const executions = await Promise.all(response.toolCalls.map((call) => this.tools.execute(userId, call, context, settings)));
      executions.forEach((execution) => execution.proposal && proposals.push(execution.proposal));
      turns.push({
        role: 'tool',
        results: response.toolCalls.map((call, index) => ({
          callId: call.id,
          name: call.name,
          content: executions[index]?.content ?? '{}',
        })),
      });
    }

    throw new BadGatewayException('The AI took too many steps without answering. Try a simpler question.');
  }

  private static toTurns(dto: ChatDto): ConversationTurn[] {
    const turns = dto.messages.slice(-MAX_HISTORY_MESSAGES).map((message): ConversationTurn => {
      return message.role === 'user'
        ? { role: 'user', text: message.content }
        : { role: 'assistant', text: message.content, toolCalls: [] };
    });
    if (turns[0]?.role === 'assistant') turns.shift();
    if (turns[turns.length - 1]?.role !== 'user') throw new BadRequestException('The last message must come from the user');
    return turns;
  }
}
