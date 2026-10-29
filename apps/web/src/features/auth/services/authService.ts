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
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) throw error;
  }

  async signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) throw error;
  }

  async getMfaRequirement(): Promise<boolean> {
    const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (error) throw error;
    return data.nextLevel === 'aal2' && data.currentLevel !== 'aal2';
  }

  async verifyMfaCode(code: string) {
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) throw error;
    const factor = data.totp[0];
    if (!factor) throw new Error('No authenticator is set up for this account');
    const verified = await supabase.auth.mfa.challengeAndVerify({ factorId: factor.id, code });
    if (verified.error) throw verified.error;
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
}

export const authService = new AuthService();
