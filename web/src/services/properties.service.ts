import apiClient from '../config/api';
import type { CreatePropertyRequest, Property } from '../types/property';

export interface UploadedImage {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
}

export const propertiesService = {
  // Create new property
  async createProperty(payload: CreatePropertyRequest): Promise<Property> {
    const response = await apiClient.post('/properties', payload);
    return response.data;
  },

  // Upload property images
  async uploadPropertyImages(files: File[]): Promise<UploadedImage[]> {
    if (!files || files.length === 0) throw new Error('No files provided');

    const form = new FormData();
    files.forEach((f) => form.append('images', f));

    const token = localStorage.getItem('accessToken');
    const response = await apiClient.post('/properties/images/upload', form, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    return response.data.images || [];
  },

  // Get properties of logged-in user
  async getMyProperties(status?: string): Promise<Property[]> {
    const response = await apiClient.get('/properties/my', { params: status ? { status } : undefined });
    return response.data;
  },

  // Get property by ID
  async getPropertyById(id: string): Promise<Property> {
    const response = await apiClient.get(`/properties/${id}`);
    return response.data;
  },

  // Update property
  async updateProperty(id: string, payload: Partial<CreatePropertyRequest>): Promise<Property> {
    const response = await apiClient.patch(`/properties/${id}`, payload);
    return response.data;
  },

  // Submit property for verification
  async submitForVerification(propertyId: string): Promise<Property> {
    const response = await apiClient.post(`/properties/${propertyId}/submit`);
    return response.data;
  },

  // Geocode location
  async geocodeLocation(query: string): Promise<any | null> {
    if (!query || query.trim().length < 2) return null;
    const response = await apiClient.get('/locations/geocode', { params: { q: query.trim() } });
    return response.data?.success ? response.data : null;
  },

  // Get all properties with optional filters
  async getAllProperties(params?: Record<string, any>): Promise<{ properties: Property[]; total: number; page: number; limit: number }> {
    const response = await apiClient.get('/properties', { params });
    return response.data;
  },
};
