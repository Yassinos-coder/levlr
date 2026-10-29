import { useQuery } from '@tanstack/react-query';
import { aiService } from '@/features/ai/services/aiService';

export function useAiSettingsQuery(userId: string) {
  return useQuery({
    queryKey: ['ai', 'settings', userId],
    queryFn: () => aiService.getSettings(),
  });
}
