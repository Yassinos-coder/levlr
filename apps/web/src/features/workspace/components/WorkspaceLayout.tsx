import { DockviewReact } from 'dockview-react';
import type { DockviewApi, DockviewReadyEvent, SerializedDockview } from 'dockview-react';
import { AiPanel } from '@/features/ai/pages/AiPanel';
import { ChartPanel } from '@/features/chart/components/ChartPanel';
import { WidgetPlaceholder } from '@/features/workspace/components/WidgetPlaceholder';
import { WIDGETS } from '@/features/workspace/constants/widgets';
import { DockLayoutUtils } from '@/features/workspace/utils/dockLayout';

const COMPONENTS = {
  ...Object.fromEntries(WIDGETS.map((widget) => [widget.id, WidgetPlaceholder])),
  chart: ChartPanel,
  ai: AiPanel,
};

interface WorkspaceLayoutProps {
  initialLayout: SerializedDockview | null;
  onLayoutChange: (layout: SerializedDockview) => void;
  onApiReady: (api: DockviewApi) => void;
}

export function WorkspaceLayout({ initialLayout, onLayoutChange, onApiReady }: WorkspaceLayoutProps) {
  const handleReady = ({ api }: DockviewReadyEvent) => {
    if (!DockLayoutUtils.restore(api, initialLayout)) DockLayoutUtils.buildDefault(api);
    api.onDidLayoutChange(() => onLayoutChange(api.toJSON()));
    onApiReady(api);
  };

  return <DockviewReact className="dockview-theme-levlr" components={COMPONENTS} onReady={handleReady} />;
}
