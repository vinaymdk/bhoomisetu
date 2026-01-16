import { Controller, Get, Query } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { GeocodingService } from '../search/services/geocoding.service';

@Controller('locations')
export class LocationsController {
  constructor(private readonly geocodingService: GeocodingService) {}

  @Public()
  @Get('geocode')
  async geocode(@Query('q') query: string) {
    if (!query || query.trim().length < 2) {
      return { success: false, message: 'Query is required' };
    }

    const result = await this.geocodingService.normalizeLocation(query.trim());
    if (!result) {
      return { success: false, message: 'No results found' };
    }

    return result;
  }
}

