import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { ThemeSync } from '@/components/providers/ThemeSync';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { WorkspacePage } from '@/features/workspace/pages/WorkspacePage';
import { persistOptions, queryClient } from '@/lib/queryClient';

function AuthGate() {
  const { session, ready } = useAuthSession();

  if (!ready) return null;
  if (!session) return <LoginPage />;
  return <WorkspacePage key={session.user.id} userId={session.user.id} email={session.user.email ?? ''} />;
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
