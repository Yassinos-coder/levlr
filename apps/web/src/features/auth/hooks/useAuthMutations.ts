import { useMutation } from '@tanstack/react-query';
import { authService } from '@/features/auth/services/authService';
import type { AuthMode, Credentials } from '@/features/auth/types/auth';

export function useAuthenticateMutation(mode: AuthMode) {
  return useMutation({
    mutationFn: (credentials: Credentials) =>
      mode === 'signIn' ? authService.signIn(credentials) : authService.signUp(credentials),
  });
}

export function useSignOutMutation() {
  return useMutation({ mutationFn: () => authService.signOut() });
}
