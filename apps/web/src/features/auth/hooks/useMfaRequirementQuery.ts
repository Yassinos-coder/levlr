import { useQuery } from '@tanstack/react-query';
import { authService } from '@/features/auth/services/authService';

export function useMfaRequirementQuery(userId: string | undefined) {
  return useQuery({
    queryKey: ['auth', 'mfa', userId],
    queryFn: () => authService.getMfaRequirement(),
    enabled: Boolean(userId),
    staleTime: 0,
    gcTime: 0,
  });
}
