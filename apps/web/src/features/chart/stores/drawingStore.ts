import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChartLevel } from '@/features/chart/types/chart';

interface DrawingState {
  levelsBySymbol: Record<string, ChartLevel[]>;
  drawMode: boolean;
  setDrawMode: (drawMode: boolean) => void;
  addLevel: (symbol: string, price: number) => void;
  removeLevel: (symbol: string, id: string) => void;
  clearLevels: (symbol: string) => void;
}

export const useDrawingStore = create<DrawingState>()(
  persist(
    (set) => ({
      levelsBySymbol: {},
      drawMode: false,
      setDrawMode: (drawMode) => set({ drawMode }),
      addLevel: (symbol, price) =>
        set((state) => {
          const existing = state.levelsBySymbol[symbol] ?? [];
          const level: ChartLevel = { id: crypto.randomUUID(), price, label: `Level ${existing.length + 1}` };
          return { levelsBySymbol: { ...state.levelsBySymbol, [symbol]: [...existing, level] }, drawMode: false };
        }),
      removeLevel: (symbol, id) =>
        set((state) => ({
          levelsBySymbol: {
            ...state.levelsBySymbol,
            [symbol]: (state.levelsBySymbol[symbol] ?? []).filter((level) => level.id !== id),
          },
        })),
      clearLevels: (symbol) => set((state) => ({ levelsBySymbol: { ...state.levelsBySymbol, [symbol]: [] } })),
    }),
    { name: 'levlr.drawings.v1', partialize: (state) => ({ levelsBySymbol: state.levelsBySymbol }) },
  ),
);
