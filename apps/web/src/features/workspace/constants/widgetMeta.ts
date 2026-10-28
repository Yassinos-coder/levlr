import { BookOpen, Briefcase, Brain, ClipboardList, FileText, History, Layers, ListOrdered, Newspaper, Rows3, Sigma, Star } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { WidgetId } from '@/features/workspace/types/workspace';

interface WidgetMeta {
  icon: LucideIcon;
  description: string;
}

export const WIDGET_META: Record<WidgetId, WidgetMeta> = {
  chart: { icon: Layers, description: 'Live candles, indicators and your orders.' },
  watchlist: { icon: Star, description: 'Pin the symbols you trade. They appear here with live prices.' },
  orderBook: { icon: Rows3, description: 'Market depth appears here once a broker is connected.' },
  contract: { icon: FileText, description: 'Contract size, tick value and trading hours for the selected symbol.' },
  ticket: { icon: ClipboardList, description: 'Place orders with risk-based sizing. Connect a broker to start.' },
  ai: { icon: Brain, description: 'Optional read-only copilot that reads your chart and drawings.' },
  news: { icon: Newspaper, description: 'Economic calendar and market news.' },
  positions: { icon: Briefcase, description: 'Open positions appear here with close, partial and break-even actions.' },
  orders: { icon: ListOrdered, description: 'Pending orders appear here.' },
  history: { icon: History, description: 'Closed trades and their results.' },
  journal: { icon: BookOpen, description: 'Every trade with its chart snapshot and notes.' },
  stats: { icon: Sigma, description: 'Performance by session, weekday, hour and symbol.' },
};
