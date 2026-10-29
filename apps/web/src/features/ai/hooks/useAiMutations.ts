import { useMutation, useQueryClient } from '@tanstack/react-query';
import { aiService } from '@/features/ai/services/aiService';
import { useAiChatStore } from '@/features/ai/stores/aiChatStore';
import type { AiSettings, ChatRequest, SizingChoice } from '@/features/ai/types/ai';
import { Notify } from '@/lib/notify';

export function useUpdateAiSettingsMutation(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: AiSettings) => aiService.updateSettings(settings),
    onSuccess: (settings) => {
      queryClient.setQueryData(['ai', 'settings', userId], settings);
      Notify.success('AI settings saved');
    },
    onError: (error) => Notify.fromError(error, 'Could not save AI settings'),
  });
}

export function useChatMutation() {
  return useMutation({
    mutationFn: (request: ChatRequest) => aiService.chat(request),
    onError: (error) => Notify.fromError(error, 'The AI could not answer'),
  });
}

export function useConfirmProposalMutation() {
  const setProposalStatus = useAiChatStore((state) => state.setProposalStatus);
  return useMutation({
    mutationFn: ({ id, sizing }: { id: string; sizing: SizingChoice }) => aiService.confirmProposal(id, sizing),
    onSuccess: (proposal) => {
      setProposalStatus(proposal.id, 'confirmed');
      Notify.success('Confirmed and sent to your broker', `Environment: ${proposal.environment}`);
    },
    onError: (error) => Notify.fromError(error, 'Could not place the trade'),
  });
}

export function useRejectProposalMutation() {
  const setProposalStatus = useAiChatStore((state) => state.setProposalStatus);
  return useMutation({
    mutationFn: (id: string) => aiService.rejectProposal(id),
    onSuccess: (proposal) => setProposalStatus(proposal.id, 'rejected'),
    onError: (error) => Notify.fromError(error, 'Could not dismiss the proposal'),
  });
}
