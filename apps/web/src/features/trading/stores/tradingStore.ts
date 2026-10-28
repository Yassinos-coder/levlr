import type { BrokerOrder, BrokerPosition } from '@levlr/broker-core';
import { create } from 'zustand';

interface TradingState {
  positions: BrokerPosition[];
  orders: BrokerOrder[];
  setSnapshot: (positions: BrokerPosition[], orders: BrokerOrder[]) => void;
  clear: () => void;
}

export const useTradingStore = create<TradingState>((set) => ({
  positions: [],
  orders: [],
  setSnapshot: (positions, orders) => set({ positions, orders }),
  clear: () => set({ positions: [], orders: [] }),
}));
