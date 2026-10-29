import { Body, Controller, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { CurrentUserId } from '@/auth/decorators/current-user-id.decorator';
import { SupabaseAuthGuard } from '@/auth/guards/supabase-auth.guard';
import { ConfirmProposalDto } from '@/ai/dto/confirm-proposal.dto';
import { AiProposalsService } from '@/ai/services/ai-proposals.service';

@Controller('ai/proposals')
@UseGuards(SupabaseAuthGuard)
export class AiProposalsController {
  constructor(private readonly service: AiProposalsService) {}

  @Post(':id/confirm')
  confirm(@CurrentUserId() userId: string, @Param('id', ParseUUIDPipe) id: string, @Body() body: ConfirmProposalDto) {
    return this.service.confirm(userId, id, { lots: body.lots, riskPct: body.riskPct });
  }

  @Post(':id/reject')
  reject(@CurrentUserId() userId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.reject(userId, id);
  }
}
