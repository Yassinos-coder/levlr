import { BadGatewayException, BadRequestException } from '@nestjs/common';
import { OPENAI_URL, REQUEST_TIMEOUT_MS } from '@/ai/constants/ai-chat';
import type { AiProviderClient, ConversationTurn, ProviderRequest, ProviderResponse, ToolCall } from '@/ai/interfaces';

interface OpenAiToolCall {
  id: string;
  function: { name: string; arguments: string };
}

type OpenAiMessage = Record<string, unknown>;

interface OpenAiResponse {
  choices?: { message?: { content?: string | null; tool_calls?: OpenAiToolCall[] } }[];
  error?: { message?: string };
}

export class OpenAiProvider implements AiProviderClient {
  async complete(request: ProviderRequest): Promise<ProviderResponse> {
    const response = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${request.apiKey}` },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      body: JSON.stringify({
        model: request.model,
        messages: [{ role: 'system', content: request.system }, ...request.turns.flatMap(OpenAiProvider.toMessages)],
        tools: request.tools.map((tool) => ({
          type: 'function',
          function: { name: tool.name, description: tool.description, parameters: tool.inputSchema },
        })),
      }),
    });

    const body = (await response.json().catch(() => ({}))) as OpenAiResponse;
    if (response.status === 401) throw new BadRequestException('OpenAI rejected your API key');
    if (!response.ok) throw new BadGatewayException(`OpenAI error: ${body.error?.message ?? response.status}`);

    const message = body.choices?.[0]?.message;
    return {
      text: (message?.content ?? '').trim(),
      toolCalls: (message?.tool_calls ?? []).map(OpenAiProvider.toToolCall),
    };
  }

  private static toToolCall(call: OpenAiToolCall): ToolCall {
    return { id: call.id, name: call.function.name, input: OpenAiProvider.parseArguments(call.function.arguments) };
  }

  private static parseArguments(raw: string): Record<string, unknown> {
    try {
      return JSON.parse(raw || '{}') as Record<string, unknown>;
    } catch {
      return {};
    }
  }

  private static toMessages(turn: ConversationTurn): OpenAiMessage[] {
    if (turn.role === 'user') return [{ role: 'user', content: turn.text }];
    if (turn.role === 'tool') {
      return turn.results.map((result) => ({ role: 'tool', tool_call_id: result.callId, content: result.content }));
    }
    return [
      {
        role: 'assistant',
        content: turn.text || null,
        tool_calls: turn.toolCalls.length
          ? turn.toolCalls.map((call) => ({
              id: call.id,
              type: 'function',
              function: { name: call.name, arguments: JSON.stringify(call.input) },
            }))
          : undefined,
      },
    ];
  }
}
