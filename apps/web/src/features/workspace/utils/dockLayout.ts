import type { DockviewApi, SerializedDockview } from 'dockview-react';
import { DEFAULT_TAB_BY_ZONE, WIDGETS, ZONE_SIZE } from '@/features/workspace/constants/widgets';
import type { PanelZone } from '@/features/workspace/types/workspace';

type ZonePosition = { referencePanel: string; direction: 'left' | 'right' | 'below' };

export class DockLayoutUtils {
  static buildDefault(api: DockviewApi) {
    DockLayoutUtils.addZone(api, 'center');
    DockLayoutUtils.addZone(api, 'left', { referencePanel: 'chart', direction: 'left' });
    DockLayoutUtils.addZone(api, 'right', { referencePanel: 'chart', direction: 'right' });
    DockLayoutUtils.addZone(api, 'bottom', { referencePanel: 'chart', direction: 'below' });

    api.getPanel('watchlist')?.api.setSize({ width: ZONE_SIZE.left });
    api.getPanel('ticket')?.api.setSize({ width: ZONE_SIZE.right });
    api.getPanel('positions')?.api.setSize({ height: ZONE_SIZE.bottom });
  }

  static reset(api: DockviewApi) {
    api.clear();
    DockLayoutUtils.buildDefault(api);
  }

  static restore(api: DockviewApi, saved: SerializedDockview | null): boolean {
    if (!saved) return false;
    try {
      api.fromJSON(saved);
      return true;
    } catch {
      api.clear();
      return false;
    }
  }

  private static addZone(api: DockviewApi, zone: PanelZone, position?: ZonePosition) {
    let anchor = '';
    WIDGETS.filter((widget) => widget.zone === zone).forEach((widget) => {
      const target = anchor ? { referencePanel: anchor } : position;
      api.addPanel({ id: widget.id, component: widget.id, title: widget.title, position: target });
      anchor = anchor || widget.id;
    });
    api.getPanel(DEFAULT_TAB_BY_ZONE[zone])?.api.setActive();
  }
}
