import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupportChatController } from './support-chat.controller';
import { SupportChatService } from './support-chat.service';
import { SupportChatSession } from './entities/support-chat-session.entity';
import { SupportChatMessage } from './entities/support-chat-message.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([SupportChatSession, SupportChatMessage]), UsersModule],
  controllers: [SupportChatController],
  providers: [SupportChatService],
  exports: [SupportChatService],
})
export class SupportChatModule {}
