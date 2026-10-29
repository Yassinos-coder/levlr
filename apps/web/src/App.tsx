import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { ThemeSync } from '@/components/providers/ThemeSync';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useMfaRequirementQuery } from '@/features/auth/hooks/useMfaRequirementQuery';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { MfaChallengePage } from '@/features/auth/pages/MfaChallengePage';
import { SettingsPage } from '@/features/settings/pages/SettingsPage';
import { WorkspacePage } from '@/features/workspace/pages/WorkspacePage';
import { useHashRoute } from '@/hooks/useHashRoute';
import { persistOptions, queryClient } from '@/lib/queryClient';

function AuthGate() {
  const { session, ready } = useAuthSession();
  const route = useHashRoute();
  const mfa = useMfaRequirementQuery(session?.user.id);

  if (!ready) return null;
  if (!session) return <LoginPage />;
  if (mfa.isPending) return null;
  if (mfa.data) return <MfaChallengePage />;

  const userId = session.user.id;
  const email = session.user.email ?? '';
  if (route === '/settings') return <SettingsPage key={userId} userId={userId} email={email} />;
  return <WorkspacePage key={userId} userId={userId} email={email} />;
}

export default function App() {
  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
      <TooltipProvider delayDuration={200}>
        <ThemeSync />
        <div className="h-full">
          <AuthGate />
        </div>
        <Toaster position="bottom-right" />
      </TooltipProvider>
    </PersistQueryClientProvider>
  );
}
