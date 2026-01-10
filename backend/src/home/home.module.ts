import { Module } from '@nestjs/common';
import { HomeController } from './home.controller';
import { PropertiesModule } from '../properties/properties.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [PropertiesModule, SubscriptionsModule],
  controllers: [HomeController],
})
export class HomeModule {}
