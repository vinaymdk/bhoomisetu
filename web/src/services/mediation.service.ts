import { apiClient } from '../config/api';
import type { MediationListResponse, InterestExpression } from '../types/mediation';

export interface ExpressInterestPayload {
  propertyId: string;
  matchId?: string;
  message?: string;
  interestType?: string;
  priority?: string;
}

export interface MediationFilter {
  connectionStatus?: string;
  includeAll?: boolean;
  propertyId?: string;
  buyerId?: string;
  sellerId?: string;
  page?: number;
  limit?: number;
}

export const mediationService = {
  async expressInterest(payload: ExpressInterestPayload): Promise<InterestExpression> {
    const response = await apiClient.post('/mediation/interest', payload);
    return response.data as InterestExpression;
  },
  async getMyInterests(filter: MediationFilter): Promise<MediationListResponse> {
    const response = await apiClient.get('/mediation/my-interests', { params: filter });
    return response.data as MediationListResponse;
  },
  async getPropertyInterests(filter: MediationFilter): Promise<MediationListResponse> {
    const response = await apiClient.get('/mediation/property-interests', { params: filter });
    return response.data as MediationListResponse;
  },
  async getPendingInterests(filter: MediationFilter): Promise<MediationListResponse> {
    const response = await apiClient.get('/mediation/pending', { params: filter });
    return response.data as MediationListResponse;
  },
  async reviewBuyerSeriousness(payload: Record<string, any>): Promise<InterestExpression> {
    const response = await apiClient.post('/mediation/review/buyer-seriousness', payload);
    return response.data as InterestExpression;
  },
  async reviewSellerWillingness(payload: Record<string, any>): Promise<InterestExpression> {
    const response = await apiClient.post('/mediation/review/seller-willingness', payload);
    return response.data as InterestExpression;
  },
  async approveConnection(payload: Record<string, any>): Promise<InterestExpression> {
    const response = await apiClient.post('/mediation/approve-connection', payload);
    return response.data as InterestExpression;
  },
  async rejectConnection(id: string, reason?: string): Promise<InterestExpression> {
    const response = await apiClient.post(`/mediation/reject-connection/${id}`, { reason });
    return response.data as InterestExpression;
  },
};

