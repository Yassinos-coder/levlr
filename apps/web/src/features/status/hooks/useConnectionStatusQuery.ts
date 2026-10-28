import { useQuery } from '@tanstack/react-query';
import { STATUS_POLL_INTERVAL_MS } from '@/features/status/constants/status';
import { statusService } from '@/features/status/services/statusService';

export function useConnectionStatusQuery() {
  return useQuery({
    queryKey: ['status', 'connection'],
    queryFn: () => statusService.measure(),
    refetchInterval: STATUS_POLL_INTERVAL_MS,
    staleTime: 0,
    gcTime: 0,
  });
}
