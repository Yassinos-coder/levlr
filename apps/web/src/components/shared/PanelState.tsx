import type { LucideIcon } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PanelStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  loading?: boolean;
  action?: ReactNode;
  className?: string;
}

export function PanelState({ icon: Icon, title, description, loading, action, className }: PanelStateProps) {
  return (
    <div className={cn('flex h-full flex-col items-center justify-center gap-3 p-6 text-center', className)}>
      <div className="flex size-11 items-center justify-center rounded-xl border bg-muted/50 text-muted-foreground">
        {loading ? <Loader2 className="size-5 animate-spin" /> : Icon && <Icon className="size-5" />}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">{title}</p>
        {description && <p className="max-w-60 text-xs text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}
