import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Payment } from './entities/payment.entity';
import { PaymentMethod } from './entities/payment-method.entity';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { SubscriptionTransaction } from './entities/subscription-transaction.entity';
import { PaymentWebhook } from './entities/payment-webhook.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { User } from '../users/entities/user.entity';
import { Property } from '../properties/entities/property.entity';
import { AiModule } from '../ai/ai.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Payment,
      PaymentMethod,
      SubscriptionPlan,
      SubscriptionTransaction,
      PaymentWebhook,
      Subscription,
      User,
      Property,
    ]),
    AiModule,
    NotificationsModule,
  ],
  providers: [PaymentsService],
  controllers: [PaymentsController],
  exports: [PaymentsService], // Export for use in other modules
})
export class PaymentsModule {}
