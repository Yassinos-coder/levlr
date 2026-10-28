import { DockviewReact } from 'dockview-react';
import type { DockviewApi, DockviewReadyEvent, SerializedDockview } from 'dockview-react';
import { ChartPanel } from '@/features/chart/components/ChartPanel';
import { WidgetPlaceholder } from '@/features/workspace/components/WidgetPlaceholder';
import { DEFAULT_TAB_BY_ZONE, WIDGETS, ZONE_SIZE } from '@/features/workspace/constants/widgets';
import type { PanelZone } from '@/features/workspace/types/workspace';

const COMPONENTS = {
  ...Object.fromEntries(WIDGETS.map((widget) => [widget.id, WidgetPlaceholder])),
  chart: ChartPanel,
};

function addZone(
  api: DockviewApi,
  zone: PanelZone,
  position?: { referencePanel: string; direction: 'left' | 'right' | 'below' },
) {
  let anchor = '';
  WIDGETS.filter((widget) => widget.zone === zone).forEach((widget) => {
    const target = anchor ? { referencePanel: anchor } : position;
    api.addPanel({ id: widget.id, component: widget.id, title: widget.title, position: target });
    anchor = anchor || widget.id;
  });
  api.getPanel(DEFAULT_TAB_BY_ZONE[zone])?.api.setActive();
}

function buildDefaultLayout(api: DockviewApi) {
  addZone(api, 'center');
  addZone(api, 'left', { referencePanel: 'chart', direction: 'left' });
  addZone(api, 'right', { referencePanel: 'chart', direction: 'right' });
  addZone(api, 'bottom', { referencePanel: 'chart', direction: 'below' });

  api.getPanel('watchlist')?.api.setSize({ width: ZONE_SIZE.left });
  api.getPanel('ticket')?.api.setSize({ width: ZONE_SIZE.right });
  api.getPanel('positions')?.api.setSize({ height: ZONE_SIZE.bottom });
}

function restoreLayout(api: DockviewApi, saved: SerializedDockview | null): boolean {
  if (!saved) return false;
  try {
    api.fromJSON(saved);
    return true;
  } catch {
    api.clear();
    return false;
  }
}

interface WorkspaceLayoutProps {
  initialLayout: SerializedDockview | null;
  onLayoutChange: (layout: SerializedDockview) => void;
}

export function WorkspaceLayout({ initialLayout, onLayoutChange }: WorkspaceLayoutProps) {
  const handleReady = ({ api }: DockviewReadyEvent) => {
    if (!restoreLayout(api, initialLayout)) buildDefaultLayout(api);
    api.onDidLayoutChange(() => onLayoutChange(api.toJSON()));
  };

  return <DockviewReact className="dockview-theme-levlr" components={COMPONENTS} onReady={handleReady} />;
}
