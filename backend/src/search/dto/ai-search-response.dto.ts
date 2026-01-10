import { PropertyResponseDto } from '../../properties/dto/property-response.dto';

export interface SearchResultProperty extends PropertyResponseDto {
  relevanceScore?: number; // 0-1, AI-calculated relevance
  urgencyScore?: number; // 0-1, urgency indicator
  popularityScore?: number; // 0-1, popularity indicator
  matchReasons?: string[]; // Why this property matched
  extractedAiTags?: string[]; // AI tags found in query
}

export interface AiSearchResponseDto {
  properties: SearchResultProperty[];
  total: number;
  page: number;
  limit: number;
  query: string;
  extractedFilters: {
    location?: {
      city?: string;
      locality?: string;
      coordinates?: { latitude: number; longitude: number };
      normalizedLocation?: string;
    };
    propertyType?: string;
    priceRange?: { min: number; max: number };
    bedrooms?: number;
    bathrooms?: number;
    aiTags?: string[];
  };
  similarProperties?: SearchResultProperty[]; // Properties within ±10% price
  searchMetadata: {
    processingTimeMs: number;
    aiRankingUsed: boolean;
    locationNormalized: boolean;
    similarPropertiesCount?: number;
  };
}
