import { PanelState } from '@/components/shared/PanelState';
import { useSignOutMutation } from '@/features/auth/hooks/useAuthMutations';
import { BrokerStatus } from '@/features/brokers/components/BrokerStatus';
import { useConnectCTraderMutation } from '@/features/brokers/hooks/useBrokerMutations';
import { useBrokerConnectionsQuery } from '@/features/brokers/hooks/useBrokerQueries';
import { StatusBar } from '@/features/status/components/StatusBar';
import { useConnectionStatusQuery } from '@/features/status/hooks/useConnectionStatusQuery';
import { WorkspaceHeader } from '@/features/workspace/components/WorkspaceHeader';
import { WorkspaceLayout } from '@/features/workspace/components/WorkspaceLayout';
import { useWorkspaceAutosave } from '@/features/workspace/hooks/useWorkspaceAutosave';
import { useDefaultWorkspaceQuery } from '@/features/workspace/hooks/useWorkspaceQueries';
import { LayoutStorage } from '@/features/workspace/stores/layoutStorage';

interface WorkspacePageProps {
  userId: string;
  email: string;
}

export function WorkspacePage({ userId, email }: WorkspacePageProps) {
  const workspace = useDefaultWorkspaceQuery(userId);
  const connections = useBrokerConnectionsQuery(userId);
  const connect = useConnectCTraderMutation();
  const signOut = useSignOutMutation();

  if (workspace.isPending) return <PanelState loading title="Loading your workspace" />;

  return (
    <WorkspaceReady
      userId={userId}
      workspaceId={workspace.data?.id}
      initialLayout={workspace.data?.layout ?? LayoutStorage.load()}
      header={
        <WorkspaceHeader email={email} onSignOut={() => signOut.mutate()}>
          <BrokerStatus
            connections={connections.data ?? []}
            connecting={connect.isPending}
            onConnect={() => connect.mutate()}
          />
        </WorkspaceHeader>
      }
    />
  );
}

interface WorkspaceReadyProps {
  userId: string;
  workspaceId: string | undefined;
  initialLayout: Parameters<typeof WorkspaceLayout>[0]['initialLayout'];
  header: React.ReactNode;
}

function WorkspaceReady({ userId, workspaceId, initialLayout, header }: WorkspaceReadyProps) {
  const handleLayoutChange = useWorkspaceAutosave(userId, workspaceId);
  const connectionStatus = useConnectionStatusQuery();

  return (
    <div className="flex h-full flex-col">
      {header}
      <div className="min-h-0 flex-1">
        <WorkspaceLayout initialLayout={initialLayout} onLayoutChange={handleLayoutChange} />
      </div>
      <StatusBar status={connectionStatus.data} />
    </div>
  );
}
