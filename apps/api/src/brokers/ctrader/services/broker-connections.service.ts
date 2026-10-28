import { Injectable } from '@nestjs/common';
import { BrokerConnectionMapper } from '@/brokers/ctrader/mappers/broker-connection.mapper';
import { BrokerConnectionRepository } from '@/brokers/ctrader/repositories/broker-connection.repository';
import type { BrokerConnectionSummary } from '@/brokers/ctrader/interfaces';

@Injectable()
export class BrokerConnectionsService {
  constructor(private readonly connections: BrokerConnectionRepository) {}

  async list(userId: string): Promise<BrokerConnectionSummary[]> {
    const rows = await this.connections.findByUser(userId);
    return rows.map(BrokerConnectionMapper.toSummary);
  }
}
