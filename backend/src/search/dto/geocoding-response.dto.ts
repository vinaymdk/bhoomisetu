export interface GeocodingResponseDto {
  success: boolean;
  location: {
    formattedAddress: string;
    city: string;
    state: string;
    country: string;
    pincode?: string;
    locality?: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  confidence: number; // 0-1
  source: 'google' | 'mapbox' | 'openstreetmap' | 'cache';
}
