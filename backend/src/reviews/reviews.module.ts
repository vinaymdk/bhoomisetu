import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { Review } from './entities/review.entity';
import { ReviewHelpfulVote } from './entities/review-helpful-vote.entity';
import { ReviewReport } from './entities/review-report.entity';
import { ReviewReply } from './entities/review-reply.entity';
import { InterestExpression } from '../mediation/entities/interest-expression.entity';
import { ChatSession } from '../mediation/entities/chat-session.entity';
import { Property } from '../properties/entities/property.entity';
import { User } from '../users/entities/user.entity';
import { AiModule } from '../ai/ai.module';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Review,
      ReviewHelpfulVote,
      ReviewReport,
      ReviewReply,
      InterestExpression,
      ChatSession,
      Property,
      User,
    ]),
    AiModule,
    UsersModule,
    forwardRef(() => NotificationsModule),
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
