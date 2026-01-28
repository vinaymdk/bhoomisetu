import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupportChatController } from './support-chat.controller';
import { SupportChatService } from './support-chat.service';
import { SupportChatGateway } from './support-chat.gateway';
import { SupportChatSession } from './entities/support-chat-session.entity';
import { SupportChatMessage } from './entities/support-chat-message.entity';
import { SupportChatAccess } from './entities/support-chat-access.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([SupportChatSession, SupportChatMessage, SupportChatAccess]), UsersModule],
  controllers: [SupportChatController],
  providers: [SupportChatService, SupportChatGateway],
  exports: [SupportChatService, SupportChatGateway],
})
export class SupportChatModule {}
