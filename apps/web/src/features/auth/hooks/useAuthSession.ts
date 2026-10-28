import { useEffect } from 'react';
import { authService } from '@/features/auth/services/authService';
import { useAuthStore } from '@/features/auth/stores/authStore';

export function useAuthSession() {
  const setSession = useAuthStore((state) => state.setSession);
  const session = useAuthStore((state) => state.session);
  const ready = useAuthStore((state) => state.ready);

  useEffect(() => {
    const loadSession = async () => {
      try {
        setSession(await authService.getSession());
      } catch {
        setSession(null);
      }
    };
    loadSession();
    const subscription = authService.onSessionChange(setSession);
    return () => subscription.unsubscribe();
  }, [setSession]);

  return { session, ready };
}
