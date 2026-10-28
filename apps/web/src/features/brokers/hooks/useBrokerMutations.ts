import { useMutation } from '@tanstack/react-query';
import { brokerService } from '@/features/brokers/services/brokerService';
import { Notify } from '@/lib/notify';

export function useConnectCTraderMutation() {
  return useMutation({
    mutationFn: () => brokerService.getCTraderConnectUrl(),
    onSuccess: ({ url }) => window.location.assign(url),
    onError: (error) => Notify.fromError(error, 'Could not start the broker connection'),
  });
}
