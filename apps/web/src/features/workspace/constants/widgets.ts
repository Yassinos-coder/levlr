import type { PanelZone, WidgetDefinition } from '@/features/workspace/types/workspace';

export const WIDGETS: WidgetDefinition[] = [
  { id: 'chart', title: 'Chart', zone: 'center' },
  { id: 'watchlist', title: 'Watchlist', zone: 'left' },
  { id: 'orderBook', title: 'Order Book', zone: 'left' },
  { id: 'contract', title: 'Contract', zone: 'left' },
  { id: 'ticket', title: 'Ticket', zone: 'right' },
  { id: 'ai', title: 'AI', zone: 'right' },
  { id: 'news', title: 'News', zone: 'right' },
  { id: 'positions', title: 'Positions', zone: 'bottom' },
  { id: 'orders', title: 'Orders', zone: 'bottom' },
  { id: 'history', title: 'History', zone: 'bottom' },
  { id: 'journal', title: 'Journal', zone: 'bottom' },
  { id: 'stats', title: 'Stats', zone: 'bottom' },
];

export const DEFAULT_TAB_BY_ZONE: Record<PanelZone, string> = {
  left: 'watchlist',
  center: 'chart',
  right: 'ticket',
  bottom: 'positions',
};

export const ZONE_SIZE = { left: 310, right: 340, bottom: 240 };

export const LAYOUT_STORAGE_KEY = 'levlr.layout.v1';

export const AUTOSAVE_DELAY_MS = 1000;
