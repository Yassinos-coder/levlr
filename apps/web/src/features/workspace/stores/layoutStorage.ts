import type { SerializedDockview } from 'dockview-react';
import { LAYOUT_STORAGE_KEY } from '@/features/workspace/constants/widgets';

export class LayoutStorage {
  static load(): SerializedDockview | null {
    try {
      const raw = localStorage.getItem(LAYOUT_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as SerializedDockview) : null;
    } catch {
      return null;
    }
  }

  static save(layout: SerializedDockview) {
    try {
      localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layout));
    } catch {
      return;
    }
  }
}
