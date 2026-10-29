import { BaseApiClient } from '@/lib/baseApiClient';
import type { AiSettings, ChatReply, ChatRequest, ProposalSummary, SizingChoice } from '@/features/ai/types/ai';

class AiService extends BaseApiClient {
  getSettings() {
    return this.get<AiSettings>('/ai/settings');
  }

  updateSettings(settings: AiSettings) {
    return this.put<AiSettings>('/ai/settings', settings);
  }

  chat(request: ChatRequest) {
    return this.post<ChatReply>('/ai/chat', request);
  }

  confirmProposal(id: string, sizing: SizingChoice) {
    return this.post<ProposalSummary>(`/ai/proposals/${id}/confirm`, sizing);
  }

  rejectProposal(id: string) {
    return this.post<ProposalSummary>(`/ai/proposals/${id}/reject`);
  }
}

export const aiService = new AiService();
