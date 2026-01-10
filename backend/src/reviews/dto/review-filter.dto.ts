import { IsOptional, IsEnum, IsUUID, IsNumber, Min, Max, IsBoolean, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ReviewType, ReviewStatus, ReviewContext } from '../entities/review.entity';

export class ReviewFilterDto {
  @IsUUID()
  @IsOptional()
  reviewerId?: string;

  @IsUUID()
  @IsOptional()
  revieweeId?: string;

  @IsUUID()
  @IsOptional()
  propertyId?: string;

  @IsEnum(ReviewType)
  @IsOptional()
  reviewType?: ReviewType;

  @IsEnum(ReviewContext)
  @IsOptional()
  reviewContext?: ReviewContext;

  @IsEnum(ReviewStatus)
  @IsOptional()
  status?: ReviewStatus;

  @IsNumber()
  @Min(1.0)
  @Type(() => Number)
  @IsOptional()
  minRating?: number;

  @IsNumber()
  @Min(1.0)
  @Type(() => Number)
  @IsOptional()
  maxRating?: number;

  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  isVerifiedPurchase?: boolean;

  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  fakeReviewDetected?: boolean;

  @IsString()
  @IsOptional()
  search?: string; // Search in comment, title, pros, cons

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number;

  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  @IsOptional()
  limit?: number;

  @IsString()
  @IsOptional()
  sortBy?: 'createdAt' | 'overallRating' | 'helpfulCount' | 'sentimentScore';

  @IsString()
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}
