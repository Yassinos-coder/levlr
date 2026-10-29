export type AiProviderId = 'openai' | 'anthropic' | 'google' | 'mistral' | 'xai' | 'openrouter';

export interface AiProviderOption {
  id: AiProviderId;
  label: string;
  keyPlaceholder: string;
}

export interface AiProviderKey {
  provider: AiProviderId;
  keyHint: string;
  updatedAt: string;
}

export interface SaveAiKeyInput {
  provider: AiProviderId;
  apiKey: string;
}

export interface PasswordChangeInput {
  password: string;
  confirmPassword: string;
}

export interface EmailChangeInput {
  email: string;
}

export interface TotpFactor {
  id: string;
  friendlyName: string | null;
  createdAt: string;
}

export interface TotpEnrollment {
  factorId: string;
  qrCode: string;
  secret: string;
}

export interface VerifyTotpInput {
  factorId: string;
  code: string;
}
