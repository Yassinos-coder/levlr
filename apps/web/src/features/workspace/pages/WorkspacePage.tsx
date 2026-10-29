import type { DockviewApi } from 'dockview-react';
import { useRef, useState } from 'react';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { PanelState } from '@/components/shared/PanelState';
import { useSignOutMutation } from '@/features/auth/hooks/useAuthMutations';
import { BrokerStatus } from '@/features/brokers/components/BrokerStatus';
import { useConnectCTraderMutation } from '@/features/brokers/hooks/useBrokerMutations';
import { useBrokerConnectionsQuery } from '@/features/brokers/hooks/useBrokerQueries';
import { StatusBar } from '@/features/status/components/StatusBar';
import { useConnectionStatusQuery } from '@/features/status/hooks/useConnectionStatusQuery';
import { LayoutMenu } from '@/features/workspace/components/LayoutMenu';
import { SaveLayoutDialog } from '@/features/workspace/components/SaveLayoutDialog';
import { WorkspaceHeader } from '@/features/workspace/components/WorkspaceHeader';
import { WorkspaceLayout } from '@/features/workspace/components/WorkspaceLayout';
import { useWorkspaceAutosave } from '@/features/workspace/hooks/useWorkspaceAutosave';
import { useDeleteLayoutMutation, useSaveNamedLayoutMutation } from '@/features/workspace/hooks/useWorkspaceMutations';
import { useDefaultWorkspaceQuery, useSavedLayoutsQuery } from '@/features/workspace/hooks/useWorkspaceQueries';
import { LayoutStorage } from '@/features/workspace/stores/layoutStorage';
import type { WorkspaceRecord } from '@/features/workspace/types/workspace';
import { DockLayoutUtils } from '@/features/workspace/utils/dockLayout';
import { navigate } from '@/hooks/useHashRoute';
import { Notify } from '@/lib/notify';

interface WorkspacePageProps {
  userId: string;
  email: string;
}

export function WorkspacePage({ userId, email }: WorkspacePageProps) {
  const workspace = useDefaultWorkspaceQuery(userId);

  if (workspace.isPending) return <PanelState loading title="Loading your workspace" />;

  return (
    <WorkspaceReady
      userId={userId}
      email={email}
      workspaceId={workspace.data?.id}
      initialLayout={workspace.data?.layout ?? LayoutStorage.load()}
    />
  );
}

interface WorkspaceReadyProps {
  userId: string;
  email: string;
  workspaceId: string | undefined;
  initialLayout: Parameters<typeof WorkspaceLayout>[0]['initialLayout'];
}

function WorkspaceReady({ userId, email, workspaceId, initialLayout }: WorkspaceReadyProps) {
  const apiRef = useRef<DockviewApi | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [layoutToDelete, setLayoutToDelete] = useState<WorkspaceRecord | null>(null);

  const handleLayoutChange = useWorkspaceAutosave(userId, workspaceId);
  const connectionStatus = useConnectionStatusQuery();
  const connections = useBrokerConnectionsQuery(userId);
  const connect = useConnectCTraderMutation();
  const signOut = useSignOutMutation();
  const savedLayouts = useSavedLayoutsQuery(userId);
  const saveLayout = useSaveNamedLayoutMutation(userId);
  const deleteLayout = useDeleteLayoutMutation(userId);

  const handleReset = () => {
    if (apiRef.current) DockLayoutUtils.reset(apiRef.current);
    setResetOpen(false);
  };

  const handleApply = (layout: WorkspaceRecord) => {
    const api = apiRef.current;
    if (!api) return;
    if (DockLayoutUtils.restore(api, layout.layout)) return;
    DockLayoutUtils.buildDefault(api);
    Notify.error('Could not load the layout', 'It was reset to the default instead.');
  };

  const handleSave = (name: string) => {
    if (!apiRef.current) return;
    saveLayout.mutate({ userId, name, layout: apiRef.current.toJSON() }, { onSuccess: () => setSaveOpen(false) });
  };

  const handleDelete = () => {
    if (layoutToDelete) deleteLayout.mutate(layoutToDelete.id);
    setLayoutToDelete(null);
  };

  return (
    <div className="flex h-full flex-col">
      <WorkspaceHeader email={email} onSignOut={() => signOut.mutate()} onOpenSettings={() => navigate('/settings')}>
        <BrokerStatus
          connections={connections.data ?? []}
          connecting={connect.isPending}
          onConnect={() => connect.mutate()}
        />
        <LayoutMenu
          layouts={savedLayouts.data ?? []}
          onReset={() => setResetOpen(true)}
          onSaveAs={() => setSaveOpen(true)}
          onApply={handleApply}
          onDelete={setLayoutToDelete}
        />
      </WorkspaceHeader>
      <div className="min-h-0 flex-1">
        <WorkspaceLayout
          initialLayout={initialLayout}
          onLayoutChange={handleLayoutChange}
          onApiReady={(api) => (apiRef.current = api)}
        />
      </div>
      <StatusBar status={connectionStatus.data} />

      <ConfirmDialog
        open={resetOpen}
        title="Reset layout?"
        description="Panels will go back to their default positions. Your saved layouts are not affected."
        confirmLabel="Reset"
        onConfirm={handleReset}
        onOpenChange={setResetOpen}
      />
      <ConfirmDialog
        open={layoutToDelete !== null}
        title="Delete saved layout?"
        description={`"${layoutToDelete?.name ?? ''}" will be permanently removed.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
        onOpenChange={(open) => !open && setLayoutToDelete(null)}
      />
      <SaveLayoutDialog open={saveOpen} pending={saveLayout.isPending} onSave={handleSave} onOpenChange={setSaveOpen} />
    </div>
  );
}
