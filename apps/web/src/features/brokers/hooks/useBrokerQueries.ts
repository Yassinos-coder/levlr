import { useQuery } from '@tanstack/react-query';
import { brokerService } from '@/features/brokers/services/brokerService';

export function useBrokerConnectionsQuery(userId: string) {
  return useQuery({
    queryKey: ['brokers', 'connections', userId],
    queryFn: () => brokerService.getConnections(),
  });
}
