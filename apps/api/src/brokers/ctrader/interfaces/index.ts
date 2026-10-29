import type { CTraderAdapter } from '@levlr/broker-ctrader';

export interface CTraderOAuthState {
  userId: string;
  nonce: string;
  issuedAt: number;
}

export interface StoredBrokerTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface BrokerConnectionRow {
  id: string;
  broker: string;
  environment: string;
  externalAccountId: string;
  accountLabel: string | null;
  status: string;
  lastSyncAt: Date | null;
  createdAt: Date;
}

export interface BrokerConnectionSummary {
  id: string;
  broker: string;
  environment: string;
  accountId: string;
  label: string | null;
  status: string;
  lastSyncAt: string | null;
}

export interface UpsertBrokerConnectionInput {
  userId: string;
  broker: string;
  environment: 'demo' | 'live';
  externalAccountId: string;
  accountLabel: string;
  secretRef: string;
}

export interface BrokerConnectionSecretRow {
  id: string;
  environment: string;
  externalAccountId: string;
  secretRef: string;
}

export interface BrokerSession {
  adapter: CTraderAdapter;
  environment: 'demo' | 'live';
}
