import { Module } from '@nestjs/common';
import { BrokerConnectionsController } from '@/brokers/ctrader/controllers/broker-connections.controller';
import { CTraderController } from '@/brokers/ctrader/controllers/ctrader.controller';
import { BrokerConnectionRepository } from '@/brokers/ctrader/repositories/broker-connection.repository';
import { BrokerConnectionsService } from '@/brokers/ctrader/services/broker-connections.service';
import { BrokerSessionService } from '@/brokers/ctrader/services/broker-session.service';
import { CTraderConnectService } from '@/brokers/ctrader/services/ctrader-connect.service';
import { CTraderLatencyService } from '@/brokers/ctrader/services/ctrader-latency.service';

@Module({
  controllers: [CTraderController, BrokerConnectionsController],
  providers: [
    CTraderConnectService,
    BrokerConnectionsService,
    BrokerConnectionRepository,
    BrokerSessionService,
    CTraderLatencyService,
  ],
  exports: [CTraderLatencyService, BrokerConnectionRepository, BrokerSessionService],
})
export class BrokersModule {}
