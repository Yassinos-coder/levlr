import { Loader2 } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { ChatBubble } from '@/features/ai/components/ChatBubble';
import { ProposalCard } from '@/features/ai/components/ProposalCard';
import type { ChatMessage, ProposalSummary, SizingChoice } from '@/features/ai/types/ai';

interface ChatThreadProps {
  messages: ChatMessage[];
  thinking: boolean;
  busyProposalId: string | undefined;
  onConfirm: (proposal: ProposalSummary, sizing: SizingChoice) => void;
  onReject: (proposal: ProposalSummary) => void;
}

export function ChatThread({ messages, thinking, busyProposalId, onConfirm, onReject }: ChatThreadProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages, thinking]);

  return (
    <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
      {messages.map((message) => (
        <div key={message.id} className="space-y-2">
          <ChatBubble role={message.role} content={message.content} />
          {message.proposals.map((proposal) => (
            <ProposalCard
              key={proposal.id}
              proposal={proposal}
              pending={busyProposalId === proposal.id}
              onConfirm={(sizing) => onConfirm(proposal, sizing)}
              onReject={() => onReject(proposal)}
            />
          ))}
        </div>
      ))}
      {thinking && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" /> Thinking…
        </div>
      )}
      <div ref={endRef} />
    </div>
  );
}
