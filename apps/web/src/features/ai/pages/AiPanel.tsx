import { Settings } from 'lucide-react';
import { PanelState } from '@/components/shared/PanelState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChatComposer } from '@/features/ai/components/ChatComposer';
import { ChatEmptyState } from '@/features/ai/components/ChatEmptyState';
import { ChatThread } from '@/features/ai/components/ChatThread';
import { useAiChat } from '@/features/ai/hooks/useAiChat';
import { useConfirmProposalMutation, useRejectProposalMutation } from '@/features/ai/hooks/useAiMutations';
import { useAiSettingsQuery } from '@/features/ai/hooks/useAiQueries';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { navigate } from '@/hooks/useHashRoute';

export function AiPanel() {
  const userId = useAuthStore((state) => state.session?.user.id ?? '');
  const settings = useAiSettingsQuery(userId);
  const { messages, send, clear, pending } = useAiChat();
  const confirm = useConfirmProposalMutation();
  const reject = useRejectProposalMutation();

  if (settings.isPending) return <PanelState loading title="Loading AI copilot" />;

  if (!settings.data?.enabled) {
    return (
      <PanelState
        icon={Settings}
        title="AI copilot is off"
        description="Add an API key and turn it on in your settings to chat about your chart."
        action={
          <Button size="sm" onClick={() => navigate('/settings')}>
            Open settings
          </Button>
        }
      />
    );
  }

  const canTrade = settings.data.allowPlanTrades || settings.data.allowManageTrades;
  const busyProposalId = confirm.isPending ? confirm.variables?.id : reject.isPending ? reject.variables : undefined;

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-9 shrink-0 items-center justify-between border-b px-3">
        <Badge variant="outline" className="text-xs">
          {canTrade ? 'Can propose trades' : 'Read-only'}
        </Badge>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={clear}>
            New chat
          </Button>
        )}
      </div>

      {messages.length === 0 ? (
        <ChatEmptyState onPick={send} />
      ) : (
        <ChatThread
          messages={messages}
          thinking={pending}
          busyProposalId={busyProposalId}
          onConfirm={(proposal, sizing) => confirm.mutate({ id: proposal.id, sizing })}
          onReject={(proposal) => reject.mutate(proposal.id)}
        />
      )}
      <ChatComposer pending={pending} onSend={send} />
    </div>
  );
}
