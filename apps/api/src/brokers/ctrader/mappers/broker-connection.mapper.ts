import type { BrokerConnectionRow, BrokerConnectionSummary } from '@/brokers/ctrader/interfaces';

export class BrokerConnectionMapper {
  static toSummary(row: BrokerConnectionRow): BrokerConnectionSummary {
    return {
      id: row.id,
      broker: row.broker,
      environment: row.environment,
      accountId: row.externalAccountId,
      label: row.accountLabel,
      status: row.status,
      lastSyncAt: row.lastSyncAt ? row.lastSyncAt.toISOString() : null,
    };
  }
}
