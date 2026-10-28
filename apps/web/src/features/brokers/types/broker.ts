export interface BrokerConnection {
  id: string;
  broker: string;
  environment: 'demo' | 'live';
  accountId: string;
  label: string | null;
  status: string;
  lastSyncAt: string | null;
}

export interface ConnectUrlResponse {
  url: string;
}
