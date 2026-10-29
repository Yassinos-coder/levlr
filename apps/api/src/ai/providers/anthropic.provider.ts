import { BadGatewayException, BadRequestException } from '@nestjs/common';
import { ANTHROPIC_URL, ANTHROPIC_VERSION, MAX_COMPLETION_TOKENS, REQUEST_TIMEOUT_MS } from '@/ai/constants/ai-chat';
import type { AiProviderClient, ConversationTurn, ProviderRequest, ProviderResponse, ToolCall } from '@/ai/interfaces';

interface AnthropicBlock {
  type: string;
  text?: string;
  id?: string;
  name?: string;
  input?: Record<string, unknown>;
}

interface AnthropicResponse {
  content?: AnthropicBlock[];
  error?: { message?: string };
}

export class AnthropicProvider implements AiProviderClient {
  async complete(request: ProviderRequest): Promise<ProviderResponse> {
    const response = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': request.apiKey, 'anthropic-version': ANTHROPIC_VERSION },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      body: JSON.stringify({
        model: request.model,
        max_tokens: MAX_COMPLETION_TOKENS,
        system: request.system,
        messages: request.turns.map(AnthropicProvider.toMessage),
        tools: request.tools.map((tool) => ({ name: tool.name, description: tool.description, input_schema: tool.inputSchema })),
      }),
    });

    const body = (await response.json().catch(() => ({}))) as AnthropicResponse;
    if (response.status === 401) throw new BadRequestException('Anthropic rejected your API key');
    if (!response.ok) throw new BadGatewayException(`Anthropic error: ${body.error?.message ?? response.status}`);

    const blocks = body.content ?? [];
    return {
      text: blocks.filter((block) => block.type === 'text').map((block) => block.text ?? '').join('\n').trim(),
      toolCalls: blocks.filter((block) => block.type === 'tool_use').map(AnthropicProvider.toToolCall),
    };
  }

  private static toToolCall(block: AnthropicBlock): ToolCall {
    return { id: block.id ?? '', name: block.name ?? '', input: block.input ?? {} };
  }

  private static toMessage(turn: ConversationTurn) {
    if (turn.role === 'user') return { role: 'user', content: turn.text };
    if (turn.role === 'tool') {
      return {
        role: 'user',
        content: turn.results.map((result) => ({ type: 'tool_result', tool_use_id: result.callId, content: result.content })),
      };
    }
    const blocks: AnthropicBlock[] = [];
    if (turn.text) blocks.push({ type: 'text', text: turn.text });
    turn.toolCalls.forEach((call) => blocks.push({ type: 'tool_use', id: call.id, name: call.name, input: call.input }));
    return { role: 'assistant', content: blocks };
  }
}
