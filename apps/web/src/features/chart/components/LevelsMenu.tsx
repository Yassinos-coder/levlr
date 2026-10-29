import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ChartLevel } from '@/features/chart/types/chart';

interface LevelsMenuProps {
  levels: ChartLevel[];
  precision: number;
  onRemove: (id: string) => void;
  onClear: () => void;
}

export function LevelsMenu({ levels, precision, onRemove, onClear }: LevelsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="px-2 text-xs" disabled={levels.length === 0}>
          Levels ({levels.length})
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-52">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Your levels</DropdownMenuLabel>
        {levels.map((level) => (
          <DropdownMenuItem key={level.id} onSelect={(event) => event.preventDefault()} className="justify-between gap-3">
            <span>
              {level.label} <span className="font-mono text-xs text-muted-foreground">{level.price.toFixed(precision)}</span>
            </span>
            <button
              type="button"
              aria-label={`Remove ${level.label}`}
              className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onRemove(level.id)}
            >
              <Trash2 className="size-3.5" />
            </button>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onClear}>Clear all levels</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
