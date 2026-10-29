import { LayoutDashboard, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { WorkspaceRecord } from '@/features/workspace/types/workspace';

interface LayoutMenuProps {
  layouts: WorkspaceRecord[];
  onReset: () => void;
  onSaveAs: () => void;
  onApply: (layout: WorkspaceRecord) => void;
  onDelete: (layout: WorkspaceRecord) => void;
}

export function LayoutMenu({ layouts, onReset, onSaveAs, onApply, onDelete }: LayoutMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5">
          <LayoutDashboard /> Layout
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuItem onClick={onSaveAs}>
          <Plus /> Save current layout as…
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onReset}>
          <RotateCcw /> Reset to default
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Saved layouts</DropdownMenuLabel>
        {layouts.length === 0 && (
          <p className="px-2 py-1.5 text-xs text-muted-foreground">No saved layouts yet</p>
        )}
        {layouts.map((layout) => (
          <DropdownMenuItem key={layout.id} onClick={() => onApply(layout)} className="justify-between gap-3">
            <span className="truncate">{layout.name}</span>
            <button
              type="button"
              aria-label={`Delete ${layout.name}`}
              className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              onClick={(event) => {
                event.stopPropagation();
                onDelete(layout);
              }}
            >
              <Trash2 className="size-3.5" />
            </button>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
