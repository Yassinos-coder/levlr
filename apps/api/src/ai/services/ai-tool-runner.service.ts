import { BadRequestException, HttpException, Injectable, Logger } from '@nestjs/common';
import { DEFAULT_CANDLES_RETURNED, MAX_CANDLES_RETURNED } from '@/ai/constants/ai-chat';
import type { AiSettingsRecord, ChartContext, ToolCall, ToolExecution } from '@/ai/interfaces';
import { AiProposalsService } from '@/ai/services/ai-proposals.service';
import { LevelTouchUtils } from '@/ai/utils/level-touch.utils';
import { ToolInputUtils } from '@/ai/utils/tool-input.utils';

const CLOSE = 4;
const SIDES = ['buy', 'sell'] as const;
const ORDER_KINDS = ['limit', 'stop'] as const;

@Injectable()
export class AiToolRunnerService {
  private readonly logger = new Logger(AiToolRunnerService.name);

  constructor(private readonly proposals: AiProposalsService) {}

  async execute(userId: string, call: ToolCall, context: ChartContext, settings: AiSettingsRecord): Promise<ToolExecution> {
    try {
      return await this.dispatch(userId, call, context, settings);
    } catch (error) {
      if (!(error instanceof HttpException)) this.logger.error(`Tool ${call.name} failed`, error instanceof Error ? error.stack : String(error));
      const message = error instanceof HttpException ? error.message : 'The tool failed unexpectedly';
      return { content: JSON.stringify({ error: message }) };
    }
  }

  private async dispatch(userId: string, call: ToolCall, context: ChartContext, settings: AiSettingsRecord): Promise<ToolExecution> {
    switch (call.name) {
      case 'get_chart_context':
        return AiToolRunnerService.json(AiToolRunnerService.chartContext(context));
      case 'get_drawings':
        return AiToolRunnerService.json(context.drawings);
      case 'get_candles':
        return AiToolRunnerService.json(AiToolRunnerService.candles(context, call.input));
      case 'count_level_touches':
        return AiToolRunnerService.json(
          LevelTouchUtils.analyse(context.bars, ToolInputUtils.number(call.input, 'price'), ToolInputUtils.optionalNumber(call.input, 'tolerance')),
        );
      case 'get_positions':
        return AiToolRunnerService.json(context.positions);
      case 'get_orders':
        return AiToolRunnerService.json(context.orders);
      case 'propose_order':
        return this.proposeOrder(userId, call, context, settings);
      case 'propose_close_position':
        return this.proposeClose(userId, call, settings);
      case 'propose_modify_position':
        return this.proposeModify(userId, call, settings);
      default:
        throw new BadRequestException(`Unknown tool: ${call.name}`);
    }
  }

  private async proposeOrder(userId: string, call: ToolCall, context: ChartContext, settings: AiSettingsRecord): Promise<ToolExecution> {
    AiToolRunnerService.assertAllowed(settings.allowPlanTrades);
    const lastBar = context.bars[context.bars.length - 1];
    const proposal = await this.proposals.createOrder(
      userId,
      {
        symbol: context.symbol,
        side: ToolInputUtils.oneOf(call.input, 'side', SIDES),
        type: ToolInputUtils.oneOf(call.input, 'type', ORDER_KINDS),
        entry: ToolInputUtils.number(call.input, 'entry'),
        sl: ToolInputUtils.number(call.input, 'sl'),
        tp: ToolInputUtils.optionalNumber(call.input, 'tp'),
        riskPct: ToolInputUtils.optionalNumber(call.input, 'riskPct'),
        lots: ToolInputUtils.optionalNumber(call.input, 'lots'),
        rationale: ToolInputUtils.string(call.input, 'rationale'),
      },
      lastBar ? lastBar[CLOSE] : 0,
    );
    return AiToolRunnerService.proposed(proposal);
  }

  private async proposeClose(userId: string, call: ToolCall, settings: AiSettingsRecord): Promise<ToolExecution> {
    AiToolRunnerService.assertAllowed(settings.allowManageTrades);
    const positionId = ToolInputUtils.string(call.input, 'positionId');
    const proposal = await this.proposals.createClose(userId, {
      positionId,
      symbol: '',
      volume: ToolInputUtils.optionalNumber(call.input, 'volume'),
      rationale: ToolInputUtils.string(call.input, 'rationale'),
    });
    return AiToolRunnerService.proposed(proposal);
  }

  private async proposeModify(userId: string, call: ToolCall, settings: AiSettingsRecord): Promise<ToolExecution> {
    AiToolRunnerService.assertAllowed(settings.allowManageTrades);
    const proposal = await this.proposals.createModify(userId, {
      positionId: ToolInputUtils.string(call.input, 'positionId'),
      symbol: '',
      sl: ToolInputUtils.optionalNumber(call.input, 'sl'),
      tp: ToolInputUtils.optionalNumber(call.input, 'tp'),
      rationale: ToolInputUtils.string(call.input, 'rationale'),
    });
    return AiToolRunnerService.proposed(proposal);
  }

  private static assertAllowed(allowed: boolean) {
    if (!allowed) throw new BadRequestException('The user has not given you permission to do this');
  }

  private static chartContext(context: ChartContext) {
    const first = context.bars[0];
    const last = context.bars[context.bars.length - 1];
    return {
      symbol: context.symbol,
      timeframe: context.timeframe,
      lastPrice: last ? last[CLOSE] : null,
      candlesLoaded: context.bars.length,
      from: first ? new Date(first[0]).toISOString() : null,
      to: last ? new Date(last[0]).toISOString() : null,
    };
  }

  private static candles(context: ChartContext, input: Record<string, unknown>) {
    const requested = ToolInputUtils.optionalNumber(input, 'count') ?? DEFAULT_CANDLES_RETURNED;
    const count = Math.min(Math.max(Math.floor(requested), 1), MAX_CANDLES_RETURNED);
    return context.bars.slice(-count).map(([time, open, high, low, close]) => ({
      time: new Date(time).toISOString(),
      open,
      high,
      low,
      close,
    }));
  }

  private static json(value: unknown): ToolExecution {
    return { content: JSON.stringify(value) };
  }

  private static proposed(proposal: ToolExecution['proposal']): ToolExecution {
    return {
      proposal,
      content: JSON.stringify({
        status: 'proposal_created',
        proposalId: proposal?.id,
        note: 'Shown to the user as a Yes/No card. Nothing has been sent to the broker. Tell the user it is waiting for their approval.',
        needsSize: proposal?.needsSize,
      }),
    };
  }
}
