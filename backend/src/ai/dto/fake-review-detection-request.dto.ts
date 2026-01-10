import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max, IsUUID, IsBoolean, IsArray, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

class PreviousReviewDto {
  @IsString()
  @IsNotEmpty()
  reviewId: string;

  @IsString()
  @IsNotEmpty()
  reviewText: string;

  @IsNumber()
  @Min(1.0)
  @Max(5.0)
  rating: number;

  @IsString()
  @IsNotEmpty()
  createdAt: string; // ISO 8601
}

class FakeDetectionContextDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PreviousReviewDto)
  @IsOptional()
  previousReviews?: PreviousReviewDto[];

  @IsNumber()
  @IsOptional()
  reviewCount?: number;

  @IsNumber()
  @IsOptional()
  accountAge?: number; // Account age in days

  @IsBoolean()
  @IsOptional()
  verifiedPurchase?: boolean;
}

export class FakeReviewDetectionRequestDto {
  @IsString()
  @IsNotEmpty()
  reviewText: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsNumber()
  @Min(1.0)
  @Max(5.0)
  rating: number;

  @IsUUID()
  @IsNotEmpty()
  reviewerId: string;

  @IsUUID()
  @IsNotEmpty()
  revieweeId: string;

  @IsUUID()
  @IsOptional()
  propertyId?: string;

  @IsUUID()
  @IsOptional()
  interestExpressionId?: string;

  @IsUUID()
  @IsOptional()
  chatSessionId?: string;

  @IsObject()
  @ValidateNested()
  @Type(() => FakeDetectionContextDto)
  @IsOptional()
  context?: FakeDetectionContextDto;
}
