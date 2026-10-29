import type { SerializedDockview } from 'dockview-react';

export type WidgetId =
  | 'watchlist'
  | 'orderBook'
  | 'contract'
  | 'chart'
  | 'ticket'
  | 'ai'
  | 'news'
  | 'positions'
  | 'orders'
  | 'history'
  | 'journal'
  | 'stats';

export type PanelZone = 'left' | 'center' | 'right' | 'bottom';

export interface WidgetDefinition {
  id: WidgetId;
  title: string;
  zone: PanelZone;
}

export interface WorkspaceRecord {
  id: string;
  name: string;
  layout: SerializedDockview;
}

export interface SaveWorkspaceInput {
  id: string | undefined;
  userId: string;
  layout: SerializedDockview;
}

export interface SaveNamedLayoutInput {
  userId: string;
  name: string;
  layout: SerializedDockview;
}
