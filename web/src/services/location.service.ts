import apiClient from '../config/api';

export interface LocationSuggestion {
  id: string;
  name: string;
  placeName: string;
  center: [number, number];
}

export interface GeocodingLocation {
  formattedAddress: string;
  city: string;
  state: string;
  country: string;
  pincode?: string;
  locality?: string;
  landmark?: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export const locationService = {
  async getAppConfig(): Promise<{ mapboxToken?: string | null }> {
    const response = await apiClient.get('/config/app');
    return response.data || {};
  },

  async autocomplete(query: string): Promise<LocationSuggestion[]> {
    if (!query || query.trim().length < 2) return [];
    const response = await apiClient.get('/locations/autocomplete', { params: { q: query.trim() } });
    return response.data?.suggestions || [];
  },

  async geocode(query: string): Promise<GeocodingLocation | null> {
    const response = await apiClient.get('/locations/geocode', { params: { q: query.trim() } });
    if (!response.data?.success) return null;
    return response.data.location;
  },

  async reverse(lat: number, lng: number): Promise<GeocodingLocation | null> {
    const response = await apiClient.get('/locations/reverse', { params: { lat, lng } });
    if (!response.data?.success) return null;
    return response.data.location;
  },
};


