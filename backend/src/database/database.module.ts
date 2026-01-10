import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Role } from '../auth/entities/role.entity';
import { UserRole } from '../auth/entities/user-role.entity';
import { LoginSession } from '../auth/entities/login-session.entity';
import { OtpLog } from '../auth/entities/otp-log.entity';
import { Property } from '../properties/entities/property.entity';
import { PropertyImage } from '../properties/entities/property-image.entity';
import { PropertyFeature } from '../properties/entities/property-feature.entity';
import { PropertyVerificationNote } from '../properties/entities/property-verification-note.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { BuyerRequirement } from '../buyer-requirements/entities/buyer-requirement.entity';
import { PropertyRequirementMatch } from '../buyer-requirements/entities/property-requirement-match.entity';
import { InterestExpression } from '../mediation/entities/interest-expression.entity';
import { CsMediationAction } from '../mediation/entities/cs-mediation-action.entity';
import { ChatSession } from '../mediation/entities/chat-session.entity';
import { ChatMessage } from '../mediation/entities/chat-message.entity';
import { AiChatConversation } from '../ai-chat/entities/ai-chat-conversation.entity';
import { AiChatMessage } from '../ai-chat/entities/ai-chat-message.entity';
import { AiChatAction } from '../ai-chat/entities/ai-chat-action.entity';
import { AiChatFaq } from '../ai-chat/entities/ai-chat-faq.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { NotificationPreference } from '../notifications/entities/notification-preference.entity';
import { NotificationDeliveryLog } from '../notifications/entities/notification-delivery-log.entity';
import { NotificationTemplate } from '../notifications/entities/notification-template.entity';
import { Payment } from '../payments/entities/payment.entity';
import { PaymentMethod } from '../payments/entities/payment-method.entity';
import { SubscriptionPlan } from '../payments/entities/subscription-plan.entity';
import { SubscriptionTransaction } from '../payments/entities/subscription-transaction.entity';
import { PaymentWebhook } from '../payments/entities/payment-webhook.entity';
import { Review } from '../reviews/entities/review.entity';
import { ReviewHelpfulVote } from '../reviews/entities/review-helpful-vote.entity';
import { ReviewReport } from '../reviews/entities/review-report.entity';
import { ReviewReply } from '../reviews/entities/review-reply.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      // password: process.env.DB_PASSWORD || 'postgres',
      password: process.env.DB_PASSWORD || 'vinaymdk',
      database: process.env.DB_NAME || 'bhoomisetu_db',
      entities: [
        User,
        Role,
        UserRole,
        LoginSession,
        OtpLog,
        Property,
        PropertyImage,
        PropertyFeature,
        PropertyVerificationNote,
        Subscription,
        BuyerRequirement,
        PropertyRequirementMatch,
        InterestExpression,
        CsMediationAction,
        ChatSession,
        ChatMessage,
        AiChatConversation,
        AiChatMessage,
        AiChatAction,
        AiChatFaq,
        Notification,
        NotificationPreference,
        NotificationDeliveryLog,
        NotificationTemplate,
        Payment,
        PaymentMethod,
        SubscriptionPlan,
        SubscriptionTransaction,
        PaymentWebhook,
        Review,
        ReviewHelpfulVote,
        ReviewReport,
        ReviewReply,
      ],
      synchronize: process.env.NODE_ENV === 'development' ? false : false, // Never use synchronize in production
      logging: process.env.NODE_ENV === 'development',
      // logging: true,
      migrations: [__dirname + '/../migrations/*{.ts,.js}'],
      migrationsRun: false, // Run migrations manually
    }),
    TypeOrmModule.forFeature([
      User,
      Role,
      UserRole,
      LoginSession,
      OtpLog,
      Property,
      PropertyImage,
      PropertyFeature,
      PropertyVerificationNote,
      Subscription,
      BuyerRequirement,
      PropertyRequirementMatch,
      InterestExpression,
      CsMediationAction,
      ChatSession,
      ChatMessage,
      AiChatConversation,
      AiChatMessage,
      AiChatAction,
      AiChatFaq,
      Notification,
      NotificationPreference,
      NotificationDeliveryLog,
      NotificationTemplate,
      Payment,
      PaymentMethod,
      SubscriptionPlan,
      SubscriptionTransaction,
      PaymentWebhook,
      Review,
      ReviewHelpfulVote,
      ReviewReport,
      ReviewReply,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
