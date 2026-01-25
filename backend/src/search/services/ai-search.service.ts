import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, IsNull } from 'typeorm';
import { Property, PropertyStatus } from '../../properties/entities/property.entity';
import { AiSearchRequestDto } from '../dto/ai-search-request.dto';
import { AiSearchResponseDto, SearchResultProperty } from '../dto/ai-search-response.dto';
import { GeocodingService } from './geocoding.service';
import { AiRankingRequestDto, AiRankingResponseDto, PropertyForRanking } from '../dto/ai-ranking-request.dto';
import { PropertyResponseDto } from '../../properties/dto/property-response.dto';
import { PropertyImage } from '../../properties/entities/property-image.entity';
import { PropertyFeature } from '../../properties/entities/property-feature.entity';

@Injectable()
export class AiSearchService {
  private readonly logger = new Logger(AiSearchService.name);
  private readonly aiServiceBaseUrl: string;

  constructor(
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    private readonly geocodingService: GeocodingService,
    private readonly httpService: HttpService,
  ) {
    this.aiServiceBaseUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
  }

  /**
   * Main AI-powered search method
   * Implements the 5-step algorithm from Module 3 spec
   */
  async search(request: AiSearchRequestDto): Promise<AiSearchResponseDto> {
    try {
      const startTime = Date.now();

      // Step 1: Normalize location using geo-coordinates
      const normalizedLocation = await this.normalizeLocation(request);

      // Step 2: Apply hard filters (price, type)
      const filteredProperties = await this.applyHardFilters(request, normalizedLocation);

      // Step 3: Rank by relevance, urgency, popularity (if AI service available)
      let rankedProperties: SearchResultProperty[] = this.defaultRanking(filteredProperties, request.rankBy || 'relevance');
      let extractedFilters = this.extractFiltersFromQuery(request, normalizedLocation);
      let aiRankingUsed = false;

      if (request.query && filteredProperties.length > 0) {
        const rankingResult = await this.rankPropertiesWithAi(
          request.query,
          filteredProperties,
          request,
        );
        
        // If AI ranking returned results, use them; otherwise use default ranking
        if (rankingResult.rankedProperties.length > 0) {
          rankedProperties = rankingResult.rankedProperties;
          extractedFilters.aiTags = rankingResult.extractedAiTags;
          aiRankingUsed = true;
        }
        // If AI service unavailable or returned empty, rankedProperties already has defaultRanking result
      }

      // Step 4: Fetch similar properties within ±10% price (if requested)
      let similarProperties: SearchResultProperty[] = [];
      if (request.includeSimilar && rankedProperties.length > 0) {
        similarProperties = await this.findSimilarProperties(
          rankedProperties,
          request.similarityThreshold || 0.8,
        );
      }

      // Step 5: Return paginated results
      const page = request.page || 1;
      const limit = request.limit || 20;
      const skip = (page - 1) * limit;
      const paginatedProperties = rankedProperties.slice(skip, skip + limit);
      const total = rankedProperties.length;

      const processingTime = Date.now() - startTime;

      return {
        properties: paginatedProperties,
        total,
        page,
        limit,
        query: request.query || '',
        extractedFilters,
        similarProperties: similarProperties.length > 0 ? similarProperties : undefined,
        searchMetadata: {
          processingTimeMs: processingTime,
          aiRankingUsed,
          locationNormalized: !!normalizedLocation,
          similarPropertiesCount: similarProperties.length,
        },
      };
    } catch (error: any) {
      this.logger.error(`Search error: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Step 1: Normalize location using geo-coordinates
   */
  private async normalizeLocation(request: AiSearchRequestDto): Promise<any> {
    let locationQuery = '';
    
    if (request.city) locationQuery = request.city;
    if (request.locality) locationQuery = `${request.locality}, ${locationQuery}`;
    if (request.area) locationQuery = `${request.area}, ${locationQuery}`;
    if (request.query) {
      // Try to extract location from natural language query
      const locationMatch = request.query.match(/\b(in|near|at)\s+([A-Za-z\s]+?)(?:\s|$)/i);
      if (locationMatch) {
        locationQuery = locationMatch[2].trim();
      }
    }

    if (locationQuery) {
      return await this.geocodingService.normalizeLocation(locationQuery);
    }

    if (request.latitude && request.longitude) {
      return {
        success: true,
        location: {
          coordinates: { latitude: request.latitude, longitude: request.longitude },
        },
      };
    }

    return null;
  }

  /**
   * Step 2: Apply hard filters (price, type)
   */
  private async applyHardFilters(request: AiSearchRequestDto, normalizedLocation: any): Promise<Property[]> {
    const queryBuilder = this.propertyRepository
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.images', 'images')
      .leftJoinAndSelect('property.propertyFeatures', 'features')
      .where('property.status = :status', { status: PropertyStatus.LIVE })
      .andWhere('property.deletedAt IS NULL');

    // Listing type
    if (request.listingType) {
      queryBuilder.andWhere('property.listingType = :listingType', { listingType: request.listingType });
    }

    // Property type
    if (request.propertyType) {
      queryBuilder.andWhere('property.propertyType = :propertyType', { propertyType: request.propertyType });
    }

    // Location filters - prioritize normalized location
    const cityFilter = normalizedLocation?.location?.city || request.city;
    if (cityFilter) {
      queryBuilder.andWhere('LOWER(property.city) LIKE LOWER(:city)', { city: `${cityFilter}%` });
    }

    const localityFilter = normalizedLocation?.location?.locality || request.locality;
    if (localityFilter) {
      queryBuilder.andWhere('LOWER(property.locality) LIKE LOWER(:locality)', {
        locality: `%${localityFilter}%`,
      });
    }

    if (request.area) {
      queryBuilder.andWhere(
        '(LOWER(property.locality) LIKE LOWER(:area) OR LOWER(property.landmark) LIKE LOWER(:area) OR LOWER(property.address) LIKE LOWER(:area))',
        { area: `%${request.area}%` },
      );
    }

    // Price range
    if (request.minPrice !== undefined || request.maxPrice !== undefined) {
      if (request.minPrice !== undefined && request.maxPrice !== undefined) {
        queryBuilder.andWhere('property.price BETWEEN :minPrice AND :maxPrice', {
          minPrice: request.minPrice,
          maxPrice: request.maxPrice,
        });
      } else if (request.minPrice !== undefined) {
        queryBuilder.andWhere('property.price >= :minPrice', { minPrice: request.minPrice });
      } else if (request.maxPrice !== undefined) {
        queryBuilder.andWhere('property.price <= :maxPrice', { maxPrice: request.maxPrice });
      }
    }

    // Area range
    if (request.minArea !== undefined || request.maxArea !== undefined) {
      if (request.minArea !== undefined && request.maxArea !== undefined) {
        queryBuilder.andWhere('property.area BETWEEN :minArea AND :maxArea', {
          minArea: request.minArea,
          maxArea: request.maxArea,
        });
      } else if (request.minArea !== undefined) {
        queryBuilder.andWhere('property.area >= :minArea', { minArea: request.minArea });
      } else if (request.maxArea !== undefined) {
        queryBuilder.andWhere('property.area <= :maxArea', { maxArea: request.maxArea });
      }
    }

    // Bedrooms/Bathrooms
    if (request.bedrooms !== undefined) {
      queryBuilder.andWhere('property.bedrooms = :bedrooms', { bedrooms: request.bedrooms });
    }
    if (request.bathrooms !== undefined) {
      queryBuilder.andWhere('property.bathrooms = :bathrooms', { bathrooms: request.bathrooms });
    }

    // Location radius (if coordinates provided)
    if (request.latitude && request.longitude && request.radius) {
      // Using PostGIS would be better, but for now we'll filter in-memory after fetch
      // For production, use: ST_DWithin(geography, geography, distance_in_meters)
    }

    // AI Tags filter (if provided)
    if (request.aiTags && request.aiTags.length > 0) {
      // This would require additional logic to match tags with property features
      // For now, we'll rely on AI ranking to handle this
    }

    const properties = await queryBuilder.getMany();

    // Apply radius filter if coordinates provided
    if (request.latitude && request.longitude && request.radius && properties.length > 0) {
      return properties.filter((prop) => {
        if (!prop.latitude || !prop.longitude) return false;
        const distance = this.geocodingService.calculateDistance(
          request.latitude!,
          request.longitude!,
          Number(prop.latitude),
          Number(prop.longitude),
        );
        return distance <= request.radius!;
      });
    }

    return properties;
  }

  /**
   * Step 3: Rank properties using AI service
   */
  private async rankPropertiesWithAi(
    query: string,
    properties: Property[],
    request: AiSearchRequestDto,
  ): Promise<{ rankedProperties: SearchResultProperty[]; extractedAiTags: string[] }> {
    try {
      const propertiesForRanking: PropertyForRanking[] = properties.map((prop) => ({
        id: prop.id,
        title: prop.title,
        description: prop.description || undefined,
        price: Number(prop.price),
        location: {
          city: prop.city,
          locality: prop.locality || undefined,
          coordinates:
            prop.latitude && prop.longitude
              ? { latitude: Number(prop.latitude), longitude: Number(prop.longitude) }
              : undefined,
        },
        propertyType: prop.propertyType,
        bedrooms: prop.bedrooms || undefined,
        bathrooms: prop.bathrooms || undefined,
        area: Number(prop.area),
        features: prop.features || undefined,
        viewsCount: prop.viewsCount,
        interestedCount: prop.interestedCount,
        createdAt: prop.createdAt.toISOString(),
        isFeatured: prop.isFeatured,
      }));

      const rankingRequest: AiRankingRequestDto = {
        userQuery: query,
        properties: propertiesForRanking,
        filters: {
          location: request.city ? { city: request.city } : undefined,
          priceRange:
            request.minPrice || request.maxPrice
              ? { min: request.minPrice, max: request.maxPrice }
              : undefined,
          propertyType: request.propertyType,
          bedrooms: request.bedrooms,
          bathrooms: request.bathrooms,
          aiTags: request.aiTags,
        },
        rankingPreference: request.rankBy || 'relevance',
      };

      const response = await firstValueFrom(
        this.httpService.post<AiRankingResponseDto>(
          `${this.aiServiceBaseUrl}/search/rank-results`,
          rankingRequest,
          {
            timeout: 10000,
            headers: {
              'Content-Type': 'application/json',
              'X-API-Key': process.env.AI_SERVICE_API_KEY || '',
            },
          },
        ),
      );

      // Map AI ranking results back to properties
      const rankingMap = new Map(
        response.data.rankedProperties.map((r) => [r.propertyId, r]),
      );

      const rankedProperties: SearchResultProperty[] = properties
        .map((prop) => {
          const ranking = rankingMap.get(prop.id);
          const propertyDto = PropertyResponseDto.fromEntity(prop);
          return {
            ...propertyDto,
            relevanceScore: ranking?.relevanceScore,
            urgencyScore: ranking?.urgencyScore,
            popularityScore: ranking?.popularityScore,
            matchReasons: ranking?.matchReasons || [],
            extractedAiTags: ranking?.extractedAiTags || [],
          } as SearchResultProperty;
        })
        .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

      const extractedAiTags = Array.from(
        new Set(
          rankedProperties.flatMap((p) => p.extractedAiTags || []),
        ),
      );

      return { rankedProperties, extractedAiTags };
    } catch (error: any) {
      // Check if it's a connection error (service unavailable)
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
        this.logger.debug('AI ranking service unavailable, using default ranking');
        // Return empty arrays - will use default ranking instead
        return {
          rankedProperties: [],
          extractedAiTags: [],
        };
      }

      // For other errors, log as warning and use default ranking
      this.logger.warn(`AI ranking failed: ${error.message}. Using default ranking.`);
      return {
        rankedProperties: [],
        extractedAiTags: [],
      };
    }
  }

  /**
   * Default ranking when AI is unavailable
   */
  private defaultRanking(properties: Property[], rankBy: string): SearchResultProperty[] {
    return properties
      .map((prop) => PropertyResponseDto.fromEntity(prop) as SearchResultProperty)
      .sort((a, b) => {
        switch (rankBy) {
          case 'price':
            return a.price - b.price;
          case 'popularity':
            return b.viewsCount - a.viewsCount;
          case 'urgency':
            // Higher interested count = more urgent
            return b.interestedCount - a.interestedCount;
          case 'newest':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case 'relevance':
          default:
            // Featured first, then by views
            if (a.isFeatured && !b.isFeatured) return -1;
            if (!a.isFeatured && b.isFeatured) return 1;
            return b.viewsCount - a.viewsCount;
        }
      });
  }

  /**
   * Step 4: Find similar properties within ±10% price
   */
  private async findSimilarProperties(
    properties: SearchResultProperty[],
    similarityThreshold: number,
  ): Promise<SearchResultProperty[]> {
    if (properties.length === 0) return [];

    // Get price range from top results
    const prices = properties.slice(0, 10).map((p) => p.price);
    const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    const priceRange = {
      min: avgPrice * (1 - 0.1), // -10%
      max: avgPrice * (1 + 0.1), // +10%
    };

    // Find properties within price range
    const similar = await this.propertyRepository.find({
      where: {
        status: PropertyStatus.LIVE,
        deletedAt: IsNull(),
        price: Between(priceRange.min, priceRange.max),
      },
      relations: ['images', 'propertyFeatures'],
      take: 20,
    });

    return similar.map((prop) => PropertyResponseDto.fromEntity(prop) as SearchResultProperty);
  }

  /**
   * Extract structured filters from natural language query
   */
  private extractFiltersFromQuery(request: AiSearchRequestDto, normalizedLocation: any): any {
    return {
      location: normalizedLocation?.location
        ? {
            city: normalizedLocation.location.city || request.city,
            locality: normalizedLocation.location.locality || request.locality,
            coordinates: normalizedLocation.location.coordinates,
            normalizedLocation: normalizedLocation.location.formattedAddress,
          }
        : {
            city: request.city,
            locality: request.locality,
          },
      propertyType: request.propertyType,
      priceRange:
        request.minPrice || request.maxPrice
          ? { min: request.minPrice, max: request.maxPrice }
          : undefined,
      bedrooms: request.bedrooms,
      bathrooms: request.bathrooms,
      aiTags: request.aiTags,
    };
  }
}
