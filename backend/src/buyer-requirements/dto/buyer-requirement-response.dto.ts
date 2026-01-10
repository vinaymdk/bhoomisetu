import { BuyerRequirement, RequirementStatus, BudgetType } from '../entities/buyer-requirement.entity';
import { PropertyType, ListingType } from '../../properties/entities/property.entity';

export class BuyerRequirementResponseDto {
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
    propertyType?: PropertyType | null;
    listingType?: ListingType | null;
    minArea?: number | null;
    maxArea?: number | null;
    areaUnit: string;
    bedrooms?: number | null;
    bathrooms?: number | null;
    requiredFeatures?: string[] | null;
  };
  status: RequirementStatus;
  matchCount: number;
  lastMatchedAt?: Date | null;
  expiresAt?: Date | null;
  metadata?: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(entity: BuyerRequirement): BuyerRequirementResponseDto {
    return {
      id: entity.id,
      buyerId: entity.buyerId,
      title: entity.title,
      description: entity.description,
      location: {
        city: entity.city,
        state: entity.state,
        locality: entity.locality,
        pincode: entity.pincode,
        landmark: entity.landmark,
        latitude: entity.latitude ? parseFloat(entity.latitude.toString()) : null,
        longitude: entity.longitude ? parseFloat(entity.longitude.toString()) : null,
      },
      budget: {
        minBudget: entity.minBudget ? parseFloat(entity.minBudget.toString()) : null,
        maxBudget: parseFloat(entity.maxBudget.toString()),
        budgetType: entity.budgetType,
      },
      propertyDetails: {
        propertyType: entity.propertyType,
        listingType: entity.listingType,
        minArea: entity.minArea ? parseFloat(entity.minArea.toString()) : null,
        maxArea: entity.maxArea ? parseFloat(entity.maxArea.toString()) : null,
        areaUnit: entity.areaUnit,
        bedrooms: entity.bedrooms,
        bathrooms: entity.bathrooms,
        requiredFeatures: entity.requiredFeatures,
      },
      status: entity.status,
      matchCount: entity.matchCount,
      lastMatchedAt: entity.lastMatchedAt,
      expiresAt: entity.expiresAt,
      metadata: entity.metadata,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
