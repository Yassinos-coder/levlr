import { Body, Controller, Delete, Get, HttpCode, Param, Put, UseGuards } from '@nestjs/common';
import { SaveAiKeyDto } from '@/ai-keys/dto/save-ai-key.dto';
import { AiKeysService } from '@/ai-keys/services/ai-keys.service';
import { CurrentUserId } from '@/auth/decorators/current-user-id.decorator';
import { SupabaseAuthGuard } from '@/auth/guards/supabase-auth.guard';

@Controller('ai/keys')
@UseGuards(SupabaseAuthGuard)
export class AiKeysController {
  constructor(private readonly service: AiKeysService) {}

  @Get()
  list(@CurrentUserId() userId: string) {
    return this.service.list(userId);
  }

  @Put(':provider')
  save(@CurrentUserId() userId: string, @Param('provider') provider: string, @Body() body: SaveAiKeyDto) {
    return this.service.save(userId, provider, body.apiKey);
  }

  @Delete(':provider')
  @HttpCode(204)
  remove(@CurrentUserId() userId: string, @Param('provider') provider: string) {
    return this.service.remove(userId, provider);
  }
}
