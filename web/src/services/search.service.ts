import apiClient from '../config/api';
import type { Property } from '../types/property';

export interface SearchResultProperty extends Property {
  relevanceScore?: number;
  urgencyScore?: number;
  popularityScore?: number;
  matchReasons?: string[];
  extractedAiTags?: string[];
}

export interface ExtractedFilters {
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
}

export interface SearchMetadata {
  processingTimeMs: number;
  aiRankingUsed: boolean;
  locationNormalized: boolean;
  similarPropertiesCount?: number;
}

export interface AiSearchResponse {
  properties: SearchResultProperty[];
  total: number;
  page: number;
  limit: number;
  query: string;
  extractedFilters: ExtractedFilters;
  similarProperties?: SearchResultProperty[];
  searchMetadata: SearchMetadata;
}

export interface SearchFilters {
  query?: string;
  listingType?: 'sale' | 'rent';
  propertyType?: string;
  city?: string;
  locality?: string;
  area?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  minArea?: number;
  maxArea?: number;
  aiTags?: string[];
  page?: number;
  limit?: number;
  rankBy?: 'relevance' | 'price' | 'popularity' | 'urgency' | 'newest';
  includeSimilar?: boolean;
  similarityThreshold?: number;
}

export const searchService = {
  async search(filters: SearchFilters): Promise<AiSearchResponse> {
    const params: Record<string, any> = {};
    
    // Add all non-undefined filters to params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          params[key] = value.join(',');
        } else {
          params[key] = value;
        }
      }
    });

    const response = await apiClient.get('/search', { params });
    return response.data;
  },

  async getSearchSuggestions(query: string): Promise<string[]> {
    try {
      const response = await apiClient.get('/search/suggestions', {
        params: { q: query },
      });
      return response.data.suggestions || [];
    } catch (error) {
      // If suggestions endpoint fails, return empty array
      return [];
    }
  },
};

