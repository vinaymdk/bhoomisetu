import { IsBoolean, IsEnum, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ConnectionStatus } from '../entities/interest-expression.entity';

export class MediationFilterDto {
  @IsOptional()
  @IsEnum(ConnectionStatus)
  connectionStatus?: ConnectionStatus;

  @IsOptional()
  @IsBoolean()
  includeAll?: boolean;

  @IsOptional()
  @IsString()
  propertyId?: string;

  @IsOptional()
  @IsString()
  buyerId?: string;

  @IsOptional()
  @IsString()
  sellerId?: string;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  limit?: number = 20;
}
