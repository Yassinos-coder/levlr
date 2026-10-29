import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CurrentUserId } from '@/auth/decorators/current-user-id.decorator';
import { SupabaseAuthGuard } from '@/auth/guards/supabase-auth.guard';
import { ChatDto } from '@/ai/dto/chat.dto';
import { AiChatService } from '@/ai/services/ai-chat.service';

@Controller('ai/chat')
@UseGuards(SupabaseAuthGuard)
export class AiChatController {
  constructor(private readonly service: AiChatService) {}

  @Post()
  chat(@CurrentUserId() userId: string, @Body() body: ChatDto) {
    return this.service.chat(userId, body);
  }
}
