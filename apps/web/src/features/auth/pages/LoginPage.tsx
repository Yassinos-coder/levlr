import { useState } from 'react';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { useAuthenticateMutation } from '@/features/auth/hooks/useAuthMutations';
import type { AuthMode } from '@/features/auth/types/auth';

export function LoginPage() {
  const [mode, setMode] = useState<AuthMode>('signIn');
  const authenticate = useAuthenticateMutation(mode);

  return (
    <div className="flex h-full items-center justify-center">
      <LoginForm
        mode={mode}
        pending={authenticate.isPending}
        errorMessage={authenticate.error?.message}
        onSubmit={(credentials) => authenticate.mutate(credentials)}
        onToggleMode={() => setMode(mode === 'signIn' ? 'signUp' : 'signIn')}
      />
    </div>
  );
}
