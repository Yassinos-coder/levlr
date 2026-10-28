import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUserId } from '@/auth/decorators/current-user-id.decorator';
import { SupabaseAuthGuard } from '@/auth/guards/supabase-auth.guard';
import { BrokerConnectionsService } from '@/brokers/ctrader/services/broker-connections.service';

@Controller('brokers/connections')
@UseGuards(SupabaseAuthGuard)
export class BrokerConnectionsController {
  constructor(private readonly service: BrokerConnectionsService) {}

  @Get()
  list(@CurrentUserId() userId: string) {
    return this.service.list(userId);
  }
}
