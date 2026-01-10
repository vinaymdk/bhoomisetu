import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { AiChatController } from './ai-chat.controller';
import { AiChatService } from './ai-chat.service';
import { AiChatConversation } from './entities/ai-chat-conversation.entity';
import { AiChatMessage } from './entities/ai-chat-message.entity';
import { AiChatAction } from './entities/ai-chat-action.entity';
import { AiChatFaq } from './entities/ai-chat-faq.entity';
import { Property } from '../properties/entities/property.entity';
import { BuyerRequirement } from '../buyer-requirements/entities/buyer-requirement.entity';
import { AiModule } from '../ai/ai.module';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AiChatConversation,
      AiChatMessage,
      AiChatAction,
      AiChatFaq,
      Property,
      BuyerRequirement,
    ]),
    HttpModule,
    AiModule, // For AI service integration
    UsersModule, // For user role checking
    NotificationsModule,
  ],
  controllers: [AiChatController],
  providers: [AiChatService],
  exports: [AiChatService],
})
export class AiChatModule {}
