import { WorkspaceHeader } from '@/features/workspace/components/WorkspaceHeader';
import { WorkspaceLayout } from '@/features/workspace/components/WorkspaceLayout';
import { useDefaultWorkspaceQuery } from '@/features/workspace/hooks/useWorkspaceQueries';
import { useWorkspaceAutosave } from '@/features/workspace/hooks/useWorkspaceAutosave';
import { LayoutStorage } from '@/features/workspace/stores/layoutStorage';
import { useSignOutMutation } from '@/features/auth/hooks/useAuthMutations';

interface WorkspacePageProps {
  userId: string;
  email: string;
}

export function WorkspacePage({ userId, email }: WorkspacePageProps) {
  const workspace = useDefaultWorkspaceQuery(userId);
  const signOut = useSignOutMutation();

  if (workspace.isPending) return <div className="p-4 text-sm text-neutral-500">Loading workspace…</div>;

  return (
    <WorkspaceReady
      userId={userId}
      email={email}
      workspaceId={workspace.data?.id}
      initialLayout={workspace.data?.layout ?? LayoutStorage.load()}
      onSignOut={() => signOut.mutate()}
    />
  );
}

interface WorkspaceReadyProps extends WorkspacePageProps {
  workspaceId: string | undefined;
  initialLayout: Parameters<typeof WorkspaceLayout>[0]['initialLayout'];
  onSignOut: () => void;
}

function WorkspaceReady({ userId, email, workspaceId, initialLayout, onSignOut }: WorkspaceReadyProps) {
  const handleLayoutChange = useWorkspaceAutosave(userId, workspaceId);

  return (
    <div className="flex h-full flex-col">
      <WorkspaceHeader email={email} onSignOut={onSignOut} />
      <div className="min-h-0 flex-1">
        <WorkspaceLayout initialLayout={initialLayout} onLayoutChange={handleLayoutChange} />
      </div>
    </div>
  );
}
