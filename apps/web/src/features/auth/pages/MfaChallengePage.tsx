import { ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/shared/Logo';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { Button } from '@/components/ui/button';
import { useSignOutMutation, useVerifyMfaMutation } from '@/features/auth/hooks/useAuthMutations';
import { TotpCodeInput } from '@/features/settings/components/TotpCodeInput';

export function MfaChallengePage() {
  const verify = useVerifyMfaMutation();
  const signOut = useSignOutMutation();

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-aurora">
      <div className="pointer-events-none absolute inset-0 bg-grid" />
      <header className="relative z-10 flex items-center justify-between px-6 py-5">
        <Logo />
        <ThemeToggle />
      </header>
      <main className="relative z-10 flex flex-1 items-center justify-center px-6 pb-12">
        <div className="glass glow w-full max-w-md space-y-5 rounded-2xl p-7">
          <div className="space-y-1">
            <ShieldCheck className="mb-2 size-6 text-primary" />
            <h2 className="text-xl font-semibold tracking-tight">Two-factor verification</h2>
            <p className="text-sm text-muted-foreground">Enter the 6-digit code from your authenticator app.</p>
          </div>
          <TotpCodeInput pending={verify.isPending} submitLabel="Verify" onSubmit={(code) => verify.mutate(code)} />
          <Button variant="ghost" size="sm" className="w-full" onClick={() => signOut.mutate()}>
            Sign out
          </Button>
        </div>
      </main>
    </div>
  );
}
