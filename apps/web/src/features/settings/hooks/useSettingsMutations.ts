import { useMutation, useQueryClient } from '@tanstack/react-query';
import { accountService } from '@/features/settings/services/accountService';
import { aiKeyService } from '@/features/settings/services/aiKeyService';
import type { AiProviderId, SaveAiKeyInput, VerifyTotpInput } from '@/features/settings/types/settings';
import { Notify } from '@/lib/notify';

export function useUpdateEmailMutation() {
  return useMutation({
    mutationFn: (email: string) => accountService.updateEmail(email),
    onSuccess: () => Notify.success('Confirmation sent', 'Check your inbox to confirm the new email address.'),
    onError: (error) => Notify.fromError(error, 'Could not change your email'),
  });
}

export function useUpdatePasswordMutation() {
  return useMutation({
    mutationFn: (password: string) => accountService.updatePassword(password),
    onSuccess: () => Notify.success('Password updated'),
    onError: (error) => Notify.fromError(error, 'Could not change your password'),
  });
}

export function useEnrollTotpMutation() {
  return useMutation({
    mutationFn: () => accountService.enrollTotp(),
    onError: (error) => Notify.fromError(error, 'Could not start two-factor setup'),
  });
}

export function useVerifyTotpMutation(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: VerifyTotpInput) => accountService.verifyTotp(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'totp', userId] });
      Notify.success('Two-factor authentication enabled');
    },
    onError: (error) => Notify.fromError(error, 'That code did not work'),
  });
}

export function useUnenrollTotpMutation(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (factorId: string) => accountService.unenrollTotp(factorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'totp', userId] });
      Notify.success('Two-factor authentication disabled');
    },
    onError: (error) => Notify.fromError(error, 'Could not disable two-factor authentication'),
  });
}

export function useSaveAiKeyMutation(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ provider, apiKey }: SaveAiKeyInput) => aiKeyService.save(provider, apiKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'ai-keys', userId] });
      Notify.success('API key saved');
    },
    onError: (error) => Notify.fromError(error, 'Could not save the API key'),
  });
}

export function useRemoveAiKeyMutation(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (provider: AiProviderId) => aiKeyService.remove(provider),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'ai-keys', userId] });
      Notify.success('API key removed');
    },
    onError: (error) => Notify.fromError(error, 'Could not remove the API key'),
  });
}
