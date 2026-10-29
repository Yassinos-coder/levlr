import { supabase } from '@/lib/supabase';
import type { TotpEnrollment, TotpFactor, VerifyTotpInput } from '@/features/settings/types/settings';

class AccountService {
  async updateEmail(email: string) {
    const { error } = await supabase.auth.updateUser({ email }, { emailRedirectTo: window.location.origin });
    if (error) throw error;
  }

  async updatePassword(password: string) {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  }

  async listTotpFactors(): Promise<TotpFactor[]> {
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) throw error;
    return data.totp.map((factor) => ({
      id: factor.id,
      friendlyName: factor.friendly_name ?? null,
      createdAt: factor.created_at,
    }));
  }

  async enrollTotp(): Promise<TotpEnrollment> {
    await this.removeUnverifiedFactors();
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'Authenticator app' });
    if (error) throw error;
    return { factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret };
  }

  async verifyTotp({ factorId, code }: VerifyTotpInput) {
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
    if (error) throw error;
  }

  async unenrollTotp(factorId: string) {
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    if (error) throw error;
  }

  private async removeUnverifiedFactors() {
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) throw error;
    const pending = data.all.filter((factor) => factor.factor_type === 'totp' && factor.status === 'unverified');
    await Promise.all(pending.map((factor) => supabase.auth.mfa.unenroll({ factorId: factor.id })));
  }
}

export const accountService = new AccountService();
