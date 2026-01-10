export interface PropertyForRanking {
  id: string;
  title: string;
  description?: string;
  price: number;
  location: {
    city: string;
    locality?: string;
    coordinates?: { latitude: number; longitude: number };
  };
  propertyType: string;
  bedrooms?: number;
  bathrooms?: number;
  area: number;
  features?: Record<string, any>;
  viewsCount: number;
  interestedCount: number;
  createdAt: string;
  isFeatured: boolean;
}

export interface AiRankingRequestDto {
  userQuery: string;
  properties: PropertyForRanking[];
  filters: {
    location?: { city?: string; coordinates?: { latitude: number; longitude: number } };
    priceRange?: { min?: number; max?: number };
    propertyType?: string;
    bedrooms?: number;
    bathrooms?: number;
    aiTags?: string[];
  };
  rankingPreference: 'relevance' | 'price' | 'popularity' | 'urgency' | 'newest';
}

export interface AiRankingResponseDto {
  rankedProperties: Array<{
    propertyId: string;
    relevanceScore: number; // 0-1
    urgencyScore?: number; // 0-1
    popularityScore?: number; // 0-1
    matchReasons: string[];
    extractedAiTags?: string[];
  }>;
}
