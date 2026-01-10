import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { BuyerRequirementsController } from './buyer-requirements.controller';
import { BuyerRequirementsService } from './buyer-requirements.service';
import { BuyerRequirement } from './entities/buyer-requirement.entity';
import { PropertyRequirementMatch } from './entities/property-requirement-match.entity';
import { Property } from '../properties/entities/property.entity';
import { SearchModule } from '../search/search.module'; // For GeocodingService
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BuyerRequirement, PropertyRequirementMatch, Property]),
    HttpModule,
    SearchModule, // For GeocodingService
    NotificationsModule,
    UsersModule, // For finding CS agents
  ],
  controllers: [BuyerRequirementsController],
  providers: [BuyerRequirementsService],
  exports: [BuyerRequirementsService], // Export for PropertiesModule to trigger matching
})
export class BuyerRequirementsModule {}
