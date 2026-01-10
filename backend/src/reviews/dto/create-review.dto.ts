import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsUUID,
  IsNumber,
  Min,
  Max,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { ReviewType, ReviewContext } from '../entities/review.entity';

export class CreateReviewDto {
  @IsUUID()
  @IsNotEmpty()
  revieweeId: string; // Seller/Agent being reviewed

  @IsUUID()
  @IsOptional()
  propertyId?: string; // Property being reviewed (optional)

  @IsUUID()
  @IsOptional()
  interestExpressionId?: string; // Link to interest expression (for viewing review)

  @IsUUID()
  @IsOptional()
  chatSessionId?: string; // Link to chat session (for deal review)

  @IsEnum(ReviewType)
  @IsNotEmpty()
  reviewType: ReviewType;

  @IsEnum(ReviewContext)
  @IsOptional()
  reviewContext?: ReviewContext;

  // Ratings
  @IsNumber()
  @Min(1.0)
  @Max(5.0)
  @IsNotEmpty()
  overallRating: number;

  @IsNumber()
  @Min(1.0)
  @Max(5.0)
  @IsOptional()
  propertyRating?: number;

  @IsNumber()
  @Min(1.0)
  @Max(5.0)
  @IsOptional()
  sellerRating?: number;

  @IsNumber()
  @Min(1.0)
  @Max(5.0)
  @IsOptional()
  responsivenessRating?: number;

  @IsNumber()
  @Min(1.0)
  @Max(5.0)
  @IsOptional()
  communicationRating?: number;

  @IsNumber()
  @Min(1.0)
  @Max(5.0)
  @IsOptional()
  professionalismRating?: number;

  // Review Content
  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  comment: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  pros?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  cons?: string;

  @IsBoolean()
  @IsOptional()
  isAnonymous?: boolean;
}
