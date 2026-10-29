import { useMutation, useQueryClient } from '@tanstack/react-query';
import { workspaceService } from '@/features/workspace/services/workspaceService';
import type { SaveNamedLayoutInput, SaveWorkspaceInput, WorkspaceRecord } from '@/features/workspace/types/workspace';
import { Notify } from '@/lib/notify';

export function useSaveWorkspaceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SaveWorkspaceInput) => workspaceService.save(input),
    onSuccess: (id, { userId, layout }) => {
      const record: WorkspaceRecord = { id, name: 'Default', layout };
      queryClient.setQueryData(['workspace', 'default', userId], record);
    },
  });
}

export function useSaveNamedLayoutMutation(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SaveNamedLayoutInput) => workspaceService.saveNamed(input),
    onSuccess: (_data, { name }) => {
      queryClient.invalidateQueries({ queryKey: ['workspace', 'saved', userId] });
      Notify.success('Layout saved', name);
    },
    onError: (error) => Notify.fromError(error, 'Could not save the layout'),
  });
}

export function useDeleteLayoutMutation(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => workspaceService.deleteSaved(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workspace', 'saved', userId] }),
    onError: (error) => Notify.fromError(error, 'Could not delete the layout'),
  });
}
