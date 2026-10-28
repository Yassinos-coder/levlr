import type { IDockviewPanelProps } from 'dockview-react';
import { PanelState } from '@/components/shared/PanelState';
import { WIDGET_META } from '@/features/workspace/constants/widgetMeta';
import type { WidgetId } from '@/features/workspace/types/workspace';

export function WidgetPlaceholder({ api }: IDockviewPanelProps) {
  const meta = WIDGET_META[api.id as WidgetId];

  return <PanelState icon={meta?.icon} title={api.title ?? ''} description={meta?.description} />;
}
