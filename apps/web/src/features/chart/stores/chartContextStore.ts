import { create } from 'zustand';
import type { ChartBar } from '@/features/chart/types/chart';

interface ChartContextState {
  symbol: string;
  timeframe: string;
  bars: ChartBar[];
  setSnapshot: (symbol: string, timeframe: string, bars: ChartBar[]) => void;
}

export const useChartContextStore = create<ChartContextState>((set) => ({
  symbol: '',
  timeframe: '',
  bars: [],
  setSnapshot: (symbol, timeframe, bars) => set({ symbol, timeframe, bars }),
}));
