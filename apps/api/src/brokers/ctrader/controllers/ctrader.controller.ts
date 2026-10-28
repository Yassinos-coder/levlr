import { Controller, Get, Query, Redirect, UseGuards } from '@nestjs/common';
import { CurrentUserId } from '@/auth/decorators/current-user-id.decorator';
import { SupabaseAuthGuard } from '@/auth/guards/supabase-auth.guard';
import { CTraderCallbackDto } from '@/brokers/ctrader/dto/ctrader-callback.dto';
import { CTraderConnectService } from '@/brokers/ctrader/services/ctrader-connect.service';

@Controller('brokers/ctrader')
export class CTraderController {
  constructor(private readonly connectService: CTraderConnectService) {}

  @Get('connect')
  @UseGuards(SupabaseAuthGuard)
  getConnectUrl(@CurrentUserId() userId: string) {
    return { url: this.connectService.buildConnectUrl(userId) };
  }

  @Get('callback')
  @Redirect()
  async handleCallback(@Query() query: CTraderCallbackDto) {
    return { url: await this.connectService.handleCallback(query) };
  }
}
