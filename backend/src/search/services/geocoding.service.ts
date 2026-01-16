import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { GeocodingResponseDto } from '../dto/geocoding-response.dto';

@Injectable()
export class GeocodingService {
  private readonly logger = new Logger(GeocodingService.name);
  private readonly googleMapsApiKey: string;
  private readonly mapboxApiKey: string;

  constructor(private readonly httpService: HttpService) {
    this.googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY || '';
    this.mapboxApiKey = process.env.MAPBOX_API_KEY || '';
  }

  /**
   * Normalize location string to structured location data with coordinates
   */
  async normalizeLocation(locationQuery: string): Promise<GeocodingResponseDto | null> {
    try {
      if (!this.mapboxApiKey && !this.googleMapsApiKey) {
        this.logger.warn('Mapbox/Google API key not configured, using basic location parsing');
        return this.basicLocationParse(locationQuery);
      }

      if (this.mapboxApiKey) {
        const mapboxResult = await this.geocodeWithMapbox(locationQuery);
        if (mapboxResult) {
          return mapboxResult;
        }
      }

      // Try Google Geocoding API
      if (this.googleMapsApiKey) {
        const response = await firstValueFrom(
          this.httpService.get('https://maps.googleapis.com/maps/api/geocode/json', {
            params: {
              address: locationQuery,
              key: this.googleMapsApiKey,
            },
            timeout: 5000,
          }),
        );

        if (response.data.status === 'OK' && response.data.results.length > 0) {
          const result = response.data.results[0];
          const location = result.geometry.location;

          // Extract address components
          const components = result.address_components.reduce((acc: any, comp: any) => {
            comp.types.forEach((type: string) => {
              acc[type] = comp.long_name;
            });
            return acc;
          }, {});

          return {
            success: true,
            location: {
              formattedAddress: result.formatted_address,
              city: components.locality || components.administrative_area_level_2 || '',
              state: components.administrative_area_level_1 || '',
              country: components.country || '',
              pincode: components.postal_code,
              locality: components.sublocality || components.neighborhood,
              coordinates: {
                latitude: location.lat,
                longitude: location.lng,
              },
            },
            confidence: 0.9,
            source: 'google',
          };
        }
      }

      return this.basicLocationParse(locationQuery);
    } catch (error: any) {
      // Check if it's a connection error
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
        this.logger.debug(`Google Maps Geocoding unavailable, using basic location parsing`);
      } else {
        this.logger.warn(`Geocoding error: ${error.message}`);
      }
      return this.basicLocationParse(locationQuery);
    }
  }

  private async geocodeWithMapbox(locationQuery: string): Promise<GeocodingResponseDto | null> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(locationQuery)}.json`, {
          params: {
            access_token: this.mapboxApiKey,
            limit: 1,
            country: 'IN',
          },
          timeout: 5000,
        }),
      );

      const features = response.data?.features || [];
      if (!features.length) return null;

      const top = features[0];
      const [longitude, latitude] = top.center || [];
      const context = top.context || [];

      const findContext = (idPrefix: string) =>
        context.find((c: any) => String(c.id || '').startsWith(idPrefix))?.text;

      return {
        success: true,
        location: {
          formattedAddress: top.place_name || locationQuery,
          city: findContext('place') || findContext('locality') || '',
          state: findContext('region') || '',
          country: findContext('country') || 'India',
          pincode: findContext('postcode'),
          locality: findContext('locality') || findContext('neighborhood'),
          coordinates: {
            latitude: latitude || 0,
            longitude: longitude || 0,
          },
        },
        confidence: 0.85,
        source: 'mapbox',
      };
    } catch (error: any) {
      this.logger.warn(`Mapbox geocoding error: ${error.message}`);
      return null;
    }
  }

  /**
   * Basic location parsing when geocoding service is unavailable
   */
  private basicLocationParse(locationQuery: string): GeocodingResponseDto | null {
    // Simple parsing: assume format "city, state" or just "city"
    const parts = locationQuery.split(',').map((p) => p.trim());
    
    return {
      success: true,
      location: {
        formattedAddress: locationQuery,
        city: parts[0] || '',
        state: parts[1] || '',
        country: 'India',
        coordinates: {
          latitude: 0,
          longitude: 0,
        },
      },
      confidence: 0.5,
      source: 'cache',
    };
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }
}
