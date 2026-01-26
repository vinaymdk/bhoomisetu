import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { SupportChatService } from './support-chat.service';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';
import { SendSupportMessageDto } from './dto/send-support-message.dto';
import { EditSupportMessageDto } from './dto/edit-support-message.dto';
import { CreateSupportSessionDto } from './dto/create-support-session.dto';
import { TypingDto } from './dto/typing.dto';
import { SupportChatRole, SupportChatStatus } from './entities/support-chat-session.entity';

@Controller('support-chat')
export class SupportChatController {
  constructor(private readonly supportChatService: SupportChatService) {}

  @Get('sessions')
  listSessions(@CurrentUser() currentUser: CurrentUserData) {
    return this.supportChatService.listSessions(currentUser.userId);
  }

  @Get('admin/sessions')
  listAdminSessions(
    @CurrentUser() currentUser: CurrentUserData,
    @Query('status') status?: SupportChatStatus,
    @Query('supportRole') supportRole?: SupportChatRole,
    @Query('search') search?: string,
  ) {
    return this.supportChatService.listAdminSessions(currentUser.userId, {
      status,
      supportRole,
      search,
    });
  }

  @Post('sessions')
  getOrCreateSession(
    @CurrentUser() currentUser: CurrentUserData,
    @Body() body: CreateSupportSessionDto,
  ) {
    return this.supportChatService.getOrCreateSession(currentUser.userId, body.supportRole);
  }

  @Get('sessions/:id/messages')
  listMessages(
    @CurrentUser() currentUser: CurrentUserData,
    @Param('id') sessionId: string,
    @Query('limit') limit?: string,
    @Query('before') before?: string,
  ) {
    return this.supportChatService.listMessages(
      sessionId,
      currentUser.userId,
      limit ? parseInt(limit, 10) : 50,
      before,
    );
  }

  @Post('sessions/:id/messages')
  sendMessage(
    @CurrentUser() currentUser: CurrentUserData,
    @Param('id') sessionId: string,
    @Body() body: SendSupportMessageDto,
  ) {
    return this.supportChatService.sendMessage(
      sessionId,
      currentUser.userId,
      body.content,
      body.messageType,
    );
  }

  @Post('sessions/:id/typing')
  setTyping(
    @CurrentUser() currentUser: CurrentUserData,
    @Param('id') sessionId: string,
    @Body() body: TypingDto,
  ) {
    return this.supportChatService.setTyping(sessionId, currentUser.userId, body.isTyping);
  }

  @Get('sessions/:id/typing')
  getTyping(@Param('id') sessionId: string) {
    return this.supportChatService.getTyping(sessionId);
  }

  @Post('messages/:id/edit')
  editMessage(
    @CurrentUser() currentUser: CurrentUserData,
    @Param('id') messageId: string,
    @Body() body: EditSupportMessageDto,
  ) {
    return this.supportChatService.editMessage(messageId, currentUser.userId, body.content);
  }

  @Post('messages/:id/delete')
  deleteMessage(@CurrentUser() currentUser: CurrentUserData, @Param('id') messageId: string) {
    return this.supportChatService.deleteMessage(messageId, currentUser.userId);
  }
}
