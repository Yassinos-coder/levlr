import { useQuery } from '@tanstack/react-query';
import { workspaceService } from '@/features/workspace/services/workspaceService';

export function useDefaultWorkspaceQuery(userId: string) {
  return useQuery({
    queryKey: ['workspace', 'default', userId],
    queryFn: () => workspaceService.getDefault(),
    staleTime: Infinity,
    retry: false,
  });
}
