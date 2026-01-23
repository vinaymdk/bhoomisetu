import { apiClient } from '../config/api';
import type {
  BuyerRequirement,
  BuyerRequirementListResponse,
  BuyerRequirementMatch,
  BudgetType,
} from '../types/buyerRequirement';

export interface CreateBuyerRequirementPayload {
  title?: string;
  description?: string;
  location: {
    city: string;
    state: string;
    locality?: string;
    pincode?: string;
    landmark?: string;
    latitude?: number;
    longitude?: number;
  };
  minBudget?: number;
  maxBudget: number;
  budgetType?: BudgetType;
  propertyType?: string;
  listingType?: string;
  minArea?: number;
  maxArea?: number;
  areaUnit?: string;
  bedrooms?: number;
  bathrooms?: number;
  requiredFeatures?: string[];
  metadata?: Record<string, any>;
  expiresInDays?: number;
  status?: string;
}

export interface BuyerRequirementFilters {
  status?: string;
  city?: string;
  propertyType?: string;
  listingType?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export const buyerRequirementsService = {
  async list(filters: BuyerRequirementFilters): Promise<BuyerRequirementListResponse> {
    const response = await apiClient.get('/buyer-requirements', { params: filters });
    return response.data as BuyerRequirementListResponse;
  },
  async getById(id: string): Promise<BuyerRequirement> {
    const response = await apiClient.get(`/buyer-requirements/${id}`);
    return response.data as BuyerRequirement;
  },
  async create(payload: CreateBuyerRequirementPayload): Promise<BuyerRequirement> {
    const response = await apiClient.post('/buyer-requirements', payload);
    return response.data as BuyerRequirement;
  },
  async update(id: string, payload: Partial<CreateBuyerRequirementPayload>): Promise<BuyerRequirement> {
    const response = await apiClient.put(`/buyer-requirements/${id}`, payload);
    return response.data as BuyerRequirement;
  },
  async remove(id: string): Promise<void> {
    await apiClient.delete(`/buyer-requirements/${id}`);
  },
  async getMatches(id: string): Promise<BuyerRequirementMatch[]> {
    const response = await apiClient.get(`/buyer-requirements/${id}/matches`);
    return response.data as BuyerRequirementMatch[];
  },
};

