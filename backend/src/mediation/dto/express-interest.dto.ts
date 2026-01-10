import { IsString, IsNotEmpty, IsOptional, IsEnum, IsUUID, MaxLength } from 'class-validator';
import { InterestType, InterestPriority } from '../entities/interest-expression.entity';

export class ExpressInterestDto {
  @IsUUID()
  @IsNotEmpty()
  propertyId!: string;

  @IsUUID()
  @IsOptional()
  matchId?: string; // Optional: link to the match that triggered this interest

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  message?: string;

  @IsEnum(InterestType)
  @IsOptional()
  interestType?: InterestType;

  @IsEnum(InterestPriority)
  @IsOptional()
  priority?: InterestPriority;
}
