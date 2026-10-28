import type { SerializedDockview } from 'dockview-react';
import { useCallback, useEffect, useRef } from 'react';
import { useSaveWorkspaceMutation } from '@/features/workspace/hooks/useWorkspaceMutations';
import { AUTOSAVE_DELAY_MS } from '@/features/workspace/constants/widgets';
import { LayoutStorage } from '@/features/workspace/stores/layoutStorage';

export function useWorkspaceAutosave(userId: string, initialWorkspaceId: string | undefined) {
  const { mutateAsync } = useSaveWorkspaceMutation();
  const workspaceId = useRef(initialWorkspaceId);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  return useCallback(
    (layout: SerializedDockview) => {
      LayoutStorage.save(layout);
      clearTimeout(timer.current);
      timer.current = setTimeout(async () => {
        try {
          workspaceId.current = await mutateAsync({ id: workspaceId.current, userId, layout });
        } catch {
          return;
        }
      }, AUTOSAVE_DELAY_MS);
    },
    [mutateAsync, userId],
  );
}
