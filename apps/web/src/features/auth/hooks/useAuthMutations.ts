import { useMutation } from '@tanstack/react-query';
import { authService } from '@/features/auth/services/authService';
import type { AuthMode, Credentials } from '@/features/auth/types/auth';
import { Notify } from '@/lib/notify';

export function useAuthenticateMutation(mode: AuthMode) {
  return useMutation({
    mutationFn: (credentials: Credentials) =>
      mode === 'signIn' ? authService.signIn(credentials) : authService.signUp(credentials),
    onSuccess: () => {
      if (mode === 'signUp') Notify.success('Account created', 'Check your inbox to confirm your email.');
    },
    onError: (error) => Notify.fromError(error, mode === 'signIn' ? 'Sign in failed' : 'Sign up failed'),
  });
}

export function useGoogleSignInMutation() {
  return useMutation({
    mutationFn: () => authService.signInWithGoogle(),
    onError: (error) => Notify.fromError(error, 'Google sign in failed'),
  });
}

export function useSignOutMutation() {
  return useMutation({
    mutationFn: () => authService.signOut(),
    onError: (error) => Notify.fromError(error, 'Sign out failed'),
  });
}
