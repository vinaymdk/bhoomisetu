import type { Property } from './property';

export type RequirementStatus = 'active' | 'fulfilled' | 'cancelled' | 'expired';
export type BudgetType = 'sale' | 'rent';

export interface BuyerRequirement {
  id: string;
  buyerId: string;
  title?: string | null;
  description?: string | null;
  location: {
    city: string;
    state: string;
    locality?: string | null;
    pincode?: string | null;
    landmark?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  };
  budget: {
    minBudget?: number | null;
    maxBudget: number;
    budgetType: BudgetType;
  };
  propertyDetails: {
    propertyType?: string | null;
    listingType?: string | null;
    minArea?: number | null;
    maxArea?: number | null;
    areaUnit: string;
    bedrooms?: number | null;
    bathrooms?: number | null;
    requiredFeatures?: string[] | null;
  };
  status: RequirementStatus;
  matchCount: number;
  lastMatchedAt?: string | null;
  expiresAt?: string | null;
  metadata?: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}

export interface BuyerRequirementMatch {
  property: Property;
  match: {
    id: string;
    locationMatchScore: number;
    budgetMatchScore: number;
    overallMatchScore: number;
    budgetOverlapPercentage?: number | null;
    locationMatchType?: string | null;
    matchReasons?: string[] | null;
    notifiedSeller: boolean;
    notifiedBuyer: boolean;
    notifiedCs: boolean;
    notifiedAt?: string | null;
    createdAt: string;
  };
  budgetOverlapPercentage: number;
  locationMatchType: string;
  matchReasons: string[];
}

export interface BuyerRequirementListResponse {
  requirements: BuyerRequirement[];
  total: number;
  page: number;
  limit: number;
}

