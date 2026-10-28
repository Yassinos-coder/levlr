import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';

interface AuthState {
  session: Session | null;
  ready: boolean;
  setSession: (session: Session | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  ready: false,
  setSession: (session) => set({ session, ready: true }),
}));
