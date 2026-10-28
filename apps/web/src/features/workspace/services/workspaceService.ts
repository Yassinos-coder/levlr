import type { SerializedDockview } from 'dockview-react';
import { supabase } from '@/lib/supabase';
import type { SaveWorkspaceInput, WorkspaceRecord } from '@/features/workspace/types/workspace';

class WorkspaceService {
  async getDefault(): Promise<WorkspaceRecord | null> {
    const { data, error } = await supabase
      .from('workspaces')
      .select('id, name, layout')
      .eq('is_default', true)
      .maybeSingle();
    if (error) throw new Error(`Failed to load workspace: ${error.message}`);
    return data as WorkspaceRecord | null;
  }

  async save({ id, userId, layout }: SaveWorkspaceInput): Promise<string> {
    await this.ensureProfile(userId);
    const row = { user_id: userId, name: 'Default', layout: layout as SerializedDockview, is_default: true };
    const query = id
      ? supabase.from('workspaces').update(row).eq('id', id)
      : supabase.from('workspaces').insert(row);
    const { data, error } = await query.select('id').single();
    if (error) throw new Error(`Failed to save workspace: ${error.message}`);
    return (data as { id: string }).id;
  }

  private async ensureProfile(userId: string) {
    const { error } = await supabase.from('profiles').upsert({ id: userId }, { onConflict: 'id', ignoreDuplicates: true });
    if (error) throw new Error(`Failed to ensure profile: ${error.message}`);
  }
}

export const workspaceService = new WorkspaceService();
