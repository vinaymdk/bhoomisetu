import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min, Max, MaxLength } from 'class-validator';
import { MediationActionType, MediationOutcome } from '../entities/cs-mediation-action.entity';

export class CsReviewInterestDto {
  @IsUUID()
  @IsNotEmpty()
  interestExpressionId!: string;

  @IsEnum(MediationActionType)
  @IsNotEmpty()
  actionType!: MediationActionType;

  // For buyer_seriousness_check
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  buyerSeriousnessScore?: number;

  @IsString()
  @IsOptional()
  @MaxLength(5000)
  buyerSeriousnessNotes?: string;

  // For seller_willingness_check
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  sellerWillingnessScore?: number;

  @IsString()
  @IsOptional()
  @MaxLength(5000)
  sellerWillingnessNotes?: string;

  @IsEnum(MediationOutcome)
  @IsNotEmpty()
  outcome!: MediationOutcome;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  outcomeReason?: string;

  @IsString()
  @IsOptional()
  @MaxLength(5000)
  notes?: string;

  @IsString()
  @IsOptional()
  @MaxLength(5000)
  internalNotes?: string; // Internal notes (not visible to buyer/seller)
}
