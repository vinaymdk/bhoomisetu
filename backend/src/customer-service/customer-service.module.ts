import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerServiceController } from './customer-service.controller';
import { CustomerServiceService } from './customer-service.service';
import { Property } from '../properties/entities/property.entity';
import { PropertyVerificationNote } from '../properties/entities/property-verification-note.entity';
import { User } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';
import { BuyerRequirementsModule } from '../buyer-requirements/buyer-requirements.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Property, PropertyVerificationNote, User]),
    UsersModule,
    forwardRef(() => BuyerRequirementsModule), // For triggering matching when property goes LIVE
    NotificationsModule,
  ],
  controllers: [CustomerServiceController],
  providers: [CustomerServiceService],
  exports: [CustomerServiceService],
})
export class CustomerServiceModule {}
