import { BaseApiClient } from '@/lib/baseApiClient';
import type { BrokerConnection, ConnectUrlResponse } from '@/features/brokers/types/broker';

class BrokerService extends BaseApiClient {
  getConnections() {
    return this.get<BrokerConnection[]>('/brokers/connections');
  }

  getCTraderConnectUrl() {
    return this.get<ConnectUrlResponse>('/brokers/ctrader/connect');
  }
}

export const brokerService = new BrokerService();
