import { useMutation } from '@tanstack/react-query';
import { brokerService } from '@/features/brokers/services/brokerService';

export function useConnectCTraderMutation() {
  return useMutation({
    mutationFn: () => brokerService.getCTraderConnectUrl(),
    onSuccess: ({ url }) => window.location.assign(url),
  });
}
