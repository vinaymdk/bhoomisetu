import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../auth/entities/user-role.entity';
import { Role } from '../auth/entities/role.entity';
import { Property } from '../properties/entities/property.entity';
import { PropertyVerificationNote } from '../properties/entities/property-verification-note.entity';
import { CsMediationAction } from '../mediation/entities/cs-mediation-action.entity';
import { InterestExpression } from '../mediation/entities/interest-expression.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { Review } from '../reviews/entities/review.entity';
import { ReviewReport } from '../reviews/entities/review-report.entity';
import { LoginSession } from '../auth/entities/login-session.entity';
import { BuyerRequirement } from '../buyer-requirements/entities/buyer-requirement.entity';
import { PropertyRequirementMatch } from '../buyer-requirements/entities/property-requirement-match.entity';
import { UsersModule } from '../users/users.module';
import { CustomerServiceModule } from '../customer-service/customer-service.module';
import { PropertiesModule } from '../properties/properties.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserRole,
      Role,
      Property,
      PropertyVerificationNote,
      CsMediationAction,
      InterestExpression,
      Payment,
      Subscription,
      Review,
      ReviewReport,
      LoginSession,
      BuyerRequirement,
      PropertyRequirementMatch,
    ]),
    UsersModule,
    forwardRef(() => CustomerServiceModule),
    forwardRef(() => PropertiesModule),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
