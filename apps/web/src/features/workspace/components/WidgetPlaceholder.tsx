import type { IDockviewPanelProps } from 'dockview-react';

export function WidgetPlaceholder({ api }: IDockviewPanelProps) {
  return (
    <div className="flex h-full items-center justify-center text-sm text-neutral-500">
      {api.title}
    </div>
  );
}
