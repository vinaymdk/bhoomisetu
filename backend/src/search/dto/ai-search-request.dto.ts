import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsArray,
  Min,
  Max,
} from 'class-validator';

import { Type } from 'class-transformer';
import { PropertyType, ListingType } from '../../properties/entities/property.entity';

export class AiSearchRequestDto {
  // Natural language search query
  @IsOptional()
  @IsString()
  query?: string; // e.g., "2BHK apartment near beach in Hyderabad"

  // Structured filters (can be combined with query)
  @IsOptional()
  @IsEnum(ListingType)
  listingType?: ListingType;

  @IsOptional()
  @IsEnum(PropertyType)
  propertyType?: PropertyType;

  // Location filters
  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  locality?: string;

  @IsOptional()
  @IsString()
  area?: string; // Area/neighborhood name

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(-90)
  @Max(90)
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(-180)
  @Max(180)
  longitude?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  radius?: number; // Radius in kilometers for location-based search

  // Price range
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  maxPrice?: number;

  // Property details
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  bedrooms?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  bathrooms?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  minArea?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  maxArea?: number;

  // AI Tags (can be extracted from query or explicitly provided)
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  aiTags?: string[]; // e.g., ['beach', 'waterfront', 'near_mall', 'metro_connected']

  // Pagination
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 20;

  // Ranking preferences
  @IsOptional()
  @IsString()
  rankBy?: 'relevance' | 'price' | 'popularity' | 'urgency' | 'newest' = 'relevance';

  // Similarity matching
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @Max(1)
  similarityThreshold?: number = 0.8; // 0-1, how similar properties should be

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  includeSimilar?: boolean = true; // Include similar properties within ±10% price
}
