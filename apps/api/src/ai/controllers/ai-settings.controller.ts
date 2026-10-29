import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { CurrentUserId } from '@/auth/decorators/current-user-id.decorator';
import { SupabaseAuthGuard } from '@/auth/guards/supabase-auth.guard';
import { UpdateAiSettingsDto } from '@/ai/dto/update-ai-settings.dto';
import { AiSettingsService } from '@/ai/services/ai-settings.service';

@Controller('ai/settings')
@UseGuards(SupabaseAuthGuard)
export class AiSettingsController {
  constructor(private readonly service: AiSettingsService) {}

  @Get()
  get(@CurrentUserId() userId: string) {
    return this.service.get(userId);
  }

  @Put()
  update(@CurrentUserId() userId: string, @Body() body: UpdateAiSettingsDto) {
    return this.service.update(userId, body);
  }
}
