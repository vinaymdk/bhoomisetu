import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  IsArray,
  Min,
  Max,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PropertyType, ListingType } from '../../properties/entities/property.entity';
import { BudgetType } from '../entities/buyer-requirement.entity';

class LocationDto {
  @IsString()
  @IsNotEmpty()
  city!: string;

  @IsString()
  @IsNotEmpty()
  state!: string;

  @IsString()
  @IsOptional()
  locality?: string;

  @IsString()
  @IsOptional()
  pincode?: string;

  @IsString()
  @IsOptional()
  landmark?: string;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;
}

export class CreateBuyerRequirementDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @ValidateNested()
  @Type(() => LocationDto)
  @IsNotEmpty()
  location!: LocationDto;

  @IsNumber()
  @Min(0)
  @IsOptional()
  minBudget?: number;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  maxBudget!: number;

  @IsEnum(BudgetType)
  @IsOptional()
  budgetType?: BudgetType;

  @IsEnum(PropertyType)
  @IsOptional()
  propertyType?: PropertyType;

  @IsEnum(ListingType)
  @IsOptional()
  listingType?: ListingType;

  @IsNumber()
  @Min(0)
  @IsOptional()
  minArea?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  maxArea?: number;

  @IsString()
  @IsOptional()
  areaUnit?: string;

  @IsNumber()
  @Min(0)
  @Max(50)
  @IsOptional()
  bedrooms?: number;

  @IsNumber()
  @Min(0)
  @Max(50)
  @IsOptional()
  bathrooms?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  requiredFeatures?: string[];

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @IsNumber()
  @IsOptional()
  @Min(1)
  expiresInDays?: number; // Number of days until requirement expires (optional)
}
