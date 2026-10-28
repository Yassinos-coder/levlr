import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Credentials } from '@/features/auth/types/auth';

class AuthService {
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  }

  onSessionChange(callback: (session: Session | null) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => callback(session)).data.subscription;
  }

  async signIn({ email, password }: Credentials) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async signUp({ email, password }: Credentials) {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
}

export const authService = new AuthService();
