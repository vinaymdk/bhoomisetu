import { Module } from '@nestjs/common';
import { SearchModule } from '../search/search.module';
import { LocationsController } from './locations.controller';

@Module({
  imports: [SearchModule],
  controllers: [LocationsController],
})
export class LocationsModule {}


