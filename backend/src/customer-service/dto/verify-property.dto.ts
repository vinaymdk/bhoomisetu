import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, IsIn } from 'class-validator';
import { UrgencyLevel } from '../../properties/entities/property-verification-note.entity';

export class VerifyPropertyDto {
  @IsUUID()
  @IsNotEmpty()
  propertyId!: string;

  @IsEnum(UrgencyLevel)
  @IsNotEmpty()
  urgencyLevel!: UrgencyLevel;

  @IsString()
  @IsOptional()
  @MaxLength(5000)
  negotiationNotes?: string;

  @IsString()
  @IsOptional()
  @MaxLength(5000)
  remarks?: string;

  // Verification result: approve or reject
  @IsString()
  @IsNotEmpty()
  @IsIn(['approve', 'reject'])
  action!: 'approve' | 'reject';

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  rejectionReason?: string; // Required if action is 'reject'
}
