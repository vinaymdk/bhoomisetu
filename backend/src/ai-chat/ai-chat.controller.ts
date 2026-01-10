import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  ParseEnumPipe,
} from '@nestjs/common';
import { AiChatService } from './ai-chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CurrentUserData } from '../auth/decorators/current-user.decorator';
import { ChatRequestDto, ChatLanguage } from '../ai/dto/chat-request.dto';
import { ConversationStatus } from './entities/ai-chat-conversation.entity';

@Controller('ai-chat')
@UseGuards(JwtAuthGuard)
export class AiChatController {
  constructor(private readonly aiChatService: AiChatService) {}

  /**
   * Send message to AI chat
   * POST /api/ai-chat/message
   */
  @Post('message')
  sendMessage(
    @CurrentUser() currentUser: CurrentUserData,
    @Body() chatDto: ChatRequestDto,
  ) {
    return this.aiChatService.sendMessage(currentUser.userId, chatDto);
  }

  /**
   * Get conversation history
   * GET /api/ai-chat/conversations/:id
   */
  @Get('conversations/:id')
  getConversation(
    @CurrentUser() currentUser: CurrentUserData,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.aiChatService.getConversation(id, currentUser.userId);
  }

  /**
   * Get user's conversations
   * GET /api/ai-chat/conversations
   */
  @Get('conversations')
  getUserConversations(
    @CurrentUser() currentUser: CurrentUserData,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.aiChatService.getUserConversations(
      currentUser.userId,
      page ? parseInt(page.toString(), 10) : 1,
      limit ? parseInt(limit.toString(), 10) : 20,
    );
  }

  /**
   * Close conversation
   * POST /api/ai-chat/conversations/:id/close
   */
  @Post('conversations/:id/close')
  closeConversation(
    @CurrentUser() currentUser: CurrentUserData,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.aiChatService.closeConversation(id, currentUser.userId);
  }

  /**
   * Get FAQs
   * GET /api/ai-chat/faqs
   */
  @Get('faqs')
  getFaqs(
    @Query('category') category?: string,
    @Query('language') language?: ChatLanguage,
  ) {
    return this.aiChatService.getFaqs(category, language || ChatLanguage.EN);
  }
}
