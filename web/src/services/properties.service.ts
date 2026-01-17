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
  async createProperty(payload: CreatePropertyRequest): Promise<Property> {
    const response = await apiClient.post('/properties', payload);
    return response.data;
  },

  async uploadPropertyImages(files: File[]): Promise<UploadedImage[]> {
    const form = new FormData();
    files.forEach((f) => form.append('images', f));
    const response = await apiClient.post('/properties/images/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.images || [];
  },

  async getMyProperties(status?: string): Promise<Property[]> {
    const response = await apiClient.get('/properties/my', { params: status ? { status } : undefined });
    return response.data;
  },

  async getPropertyById(id: string): Promise<Property> {
    const response = await apiClient.get(`/properties/${id}`);
    return response.data;
  },

  async updateProperty(id: string, payload: Partial<CreatePropertyRequest>): Promise<Property> {
    const response = await apiClient.patch(`/properties/${id}`, payload);
    return response.data;
  },

  async submitForVerification(propertyId: string): Promise<Property> {
    const response = await apiClient.post(`/properties/${propertyId}/submit`);
    return response.data;
  },

  async geocodeLocation(query: string): Promise<any | null> {
    if (!query || query.trim().length < 2) return null;
    const response = await apiClient.get('/locations/geocode', { params: { q: query.trim() } });
    return response.data?.success ? response.data : null;
  },

  async getAllProperties(params?: Record<string, any>): Promise<{ properties: Property[]; total: number; page: number; limit: number }> {
    const response = await apiClient.get('/properties', { params });
    return response.data;
  },
};


