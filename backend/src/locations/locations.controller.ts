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

  @Public()
  @Get('autocomplete')
  async autocomplete(@Query('q') query: string) {
    return this.geocodingService.autocompleteLocation(query);
  }

  @Public()
  @Get('reverse')
  async reverse(@Query('lat') lat: string, @Query('lng') lng: string) {
    const latitude = Number(lat);
    const longitude = Number(lng);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return { success: false, message: 'Valid lat/lng required' };
    }
    const result = await this.geocodingService.reverseGeocode(latitude, longitude);
    if (!result) {
      return { success: false, message: 'No results found' };
    }
    return result;
  }
}

