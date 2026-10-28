import { useState } from 'react';
import { Logo } from '@/components/shared/Logo';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { LoginHighlights } from '@/features/auth/components/LoginHighlights';
import { useAuthenticateMutation, useGoogleSignInMutation } from '@/features/auth/hooks/useAuthMutations';
import type { AuthMode } from '@/features/auth/types/auth';

export function LoginPage() {
  const [mode, setMode] = useState<AuthMode>('signIn');
  const authenticate = useAuthenticateMutation(mode);
  const google = useGoogleSignInMutation();

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-aurora">
      <div className="pointer-events-none absolute inset-0 bg-grid" />

      <header className="relative z-10 flex items-center justify-between px-6 py-5">
        <Logo />
        <ThemeToggle />
      </header>

      <main className="relative z-10 grid flex-1 items-center gap-12 px-6 pb-12 lg:grid-cols-2 lg:px-16">
        <LoginHighlights className="hidden lg:block" />
        <div className="glass glow mx-auto w-full max-w-md rounded-2xl p-7">
          <LoginForm
            mode={mode}
            pending={authenticate.isPending || google.isPending}
            onSubmit={(credentials) => authenticate.mutate(credentials)}
            onGoogleSignIn={() => google.mutate()}
            onToggleMode={() => setMode(mode === 'signIn' ? 'signUp' : 'signIn')}
          />
        </div>
      </main>
    </div>
  );
}
