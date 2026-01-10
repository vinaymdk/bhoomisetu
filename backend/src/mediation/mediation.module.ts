import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediationController } from './mediation.controller';
import { MediationService } from './mediation.service';
import { InterestExpression } from './entities/interest-expression.entity';
import { CsMediationAction } from './entities/cs-mediation-action.entity';
import { ChatSession } from './entities/chat-session.entity';
import { ChatMessage } from './entities/chat-message.entity';
import { Property } from '../properties/entities/property.entity';
import { PropertyRequirementMatch } from '../buyer-requirements/entities/property-requirement-match.entity';
import { UsersModule } from '../users/users.module';
import { AiModule } from '../ai/ai.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InterestExpression,
      CsMediationAction,
      ChatSession,
      ChatMessage,
      Property,
      PropertyRequirementMatch,
    ]),
    UsersModule,
    AiModule,
    NotificationsModule,
    forwardRef(() => SubscriptionsModule),
  ],
  controllers: [MediationController],
  providers: [MediationService],
  exports: [MediationService],
})
export class MediationModule {}
