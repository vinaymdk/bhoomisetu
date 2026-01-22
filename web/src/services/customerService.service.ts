import apiClient from '../config/api';
import type {
  PendingVerificationResponse,
  PendingVerificationProperty,
  VerifyPropertyPayload,
  CsStats,
} from '../types/customer-service';
import type { Property } from '../types/property';

export const customerService = {
  async getPending(params: Record<string, any>): Promise<PendingVerificationResponse> {
    const cleanedParams = Object.fromEntries(
      Object.entries(params || {}).filter(
        ([, value]) => value !== undefined && value !== null && String(value).trim() !== '',
      ),
    );
    const response = await apiClient.get('/customer-service/pending', { params: cleanedParams });
    return response.data;
  },

  async getProperty(propertyId: string): Promise<PendingVerificationProperty> {
    const response = await apiClient.get(`/customer-service/properties/${propertyId}`);
    return response.data;
  },

  async verifyProperty(payload: VerifyPropertyPayload): Promise<Property> {
    const response = await apiClient.post('/customer-service/verify', payload);
    return response.data;
  },

  async getStats(): Promise<CsStats> {
    const response = await apiClient.get('/customer-service/stats');
    return response.data;
  },
};
