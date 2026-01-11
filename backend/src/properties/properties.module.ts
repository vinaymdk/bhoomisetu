import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertiesService } from './properties.service';
import { PropertiesController } from './properties.controller';
import { Property } from './entities/property.entity';
import { PropertyImage } from './entities/property-image.entity';
import { PropertyFeature } from './entities/property-feature.entity';
import { PropertyVerificationNote } from './entities/property-verification-note.entity';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Property, PropertyImage, PropertyFeature, PropertyVerificationNote]),
    forwardRef(() => SubscriptionsModule),
    StorageModule,
  ],
  controllers: [PropertiesController],
  providers: [PropertiesService],
  exports: [PropertiesService],
})
export class PropertiesModule {}
