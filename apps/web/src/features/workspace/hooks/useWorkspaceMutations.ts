import { useMutation } from '@tanstack/react-query';
import { workspaceService } from '@/features/workspace/services/workspaceService';
import type { SaveWorkspaceInput } from '@/features/workspace/types/workspace';

export function useSaveWorkspaceMutation() {
  return useMutation({ mutationFn: (input: SaveWorkspaceInput) => workspaceService.save(input) });
}
