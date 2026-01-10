import { IsOptional, IsEnum, IsString, IsNumber, Min, Max, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export enum UserStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  DELETED = 'deleted',
}

export class UserFilterDto {
  @IsString()
  @IsOptional()
  search?: string; // Search in name, email, phone

  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;

  @IsString()
  @IsOptional()
  role?: string; // Filter by role (buyer, seller, agent, customer_service, admin)

  @IsNumber()
  @Min(1.0)
  @Type(() => Number)
  @IsOptional()
  minFraudScore?: number;

  @IsNumber()
  @Min(1.0)
  @Type(() => Number)
  @IsOptional()
  maxFraudScore?: number;

  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  hasActiveSubscription?: boolean;

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
  sortBy?: 'createdAt' | 'lastLoginAt' | 'fraudRiskScore' | 'fullName';

  @IsString()
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}
