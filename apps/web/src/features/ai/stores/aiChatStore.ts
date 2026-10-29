import { create } from 'zustand';
import type { ChatMessage, ProposalStatus } from '@/features/ai/types/ai';

interface AiChatState {
  messages: ChatMessage[];
  append: (message: ChatMessage) => void;
  setProposalStatus: (proposalId: string, status: ProposalStatus) => void;
  clear: () => void;
}

export const useAiChatStore = create<AiChatState>((set) => ({
  messages: [],
  append: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setProposalStatus: (proposalId, status) =>
    set((state) => ({
      messages: state.messages.map((message) => ({
        ...message,
        proposals: message.proposals.map((proposal) => (proposal.id === proposalId ? { ...proposal, status } : proposal)),
      })),
    })),
  clear: () => set({ messages: [] }),
}));
