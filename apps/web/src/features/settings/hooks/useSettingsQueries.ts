import { useQuery } from '@tanstack/react-query';
import { accountService } from '@/features/settings/services/accountService';
import { aiKeyService } from '@/features/settings/services/aiKeyService';

export function useTotpFactorsQuery(userId: string) {
  return useQuery({
    queryKey: ['settings', 'totp', userId],
    queryFn: () => accountService.listTotpFactors(),
  });
}

export function useAiKeysQuery(userId: string) {
  return useQuery({
    queryKey: ['settings', 'ai-keys', userId],
    queryFn: () => aiKeyService.list(),
  });
}
