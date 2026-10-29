import { useCallback } from 'react';
import { useChartContextStore } from '@/features/chart/stores/chartContextStore';
import { useDrawingStore } from '@/features/chart/stores/drawingStore';
import { useChatMutation } from '@/features/ai/hooks/useAiMutations';
import { useAiChatStore } from '@/features/ai/stores/aiChatStore';
import { ChatContextUtils } from '@/features/ai/utils/chatContext';
import { useTradingStore } from '@/features/trading/stores/tradingStore';

export function useAiChat() {
  const messages = useAiChatStore((state) => state.messages);
  const append = useAiChatStore((state) => state.append);
  const clear = useAiChatStore((state) => state.clear);
  const chat = useChatMutation();

  const send = useCallback(
    (text: string) => {
      const content = text.trim();
      if (!content || chat.isPending) return;

      const history = [...useAiChatStore.getState().messages, { id: crypto.randomUUID(), role: 'user' as const, content, proposals: [] }];
      append(history[history.length - 1]!);

      const chart = useChartContextStore.getState();
      const context = ChatContextUtils.build({
        symbol: chart.symbol,
        timeframe: chart.timeframe,
        bars: chart.bars,
        levels: useDrawingStore.getState().levelsBySymbol[chart.symbol] ?? [],
        positions: useTradingStore.getState().positions,
        orders: useTradingStore.getState().orders,
      });

      chat.mutate(
        { messages: history.map(({ role, content: body }) => ({ role, content: body })), context },
        { onSuccess: (reply) => append({ id: crypto.randomUUID(), role: 'assistant', content: reply.reply, proposals: reply.proposals }) },
      );
    },
    [append, chat],
  );

  return { messages, send, clear, pending: chat.isPending };
}
