import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchController } from './search.controller';
import { AiSearchService } from './services/ai-search.service';
import { GeocodingService } from './services/geocoding.service';
import { Property } from '../properties/entities/property.entity';
import { PropertyLike } from '../properties/entities/property-like.entity';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
    TypeOrmModule.forFeature([Property, PropertyLike]),
  ],
  controllers: [SearchController],
  providers: [AiSearchService, GeocodingService],
  exports: [AiSearchService, GeocodingService],
})
export class SearchModule {}
