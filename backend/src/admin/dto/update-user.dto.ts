import { IsOptional, IsEnum, IsString, IsBoolean, IsArray, IsNumber } from 'class-validator';
import { UserStatus } from './user-filter.dto';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;

  @IsBoolean()
  @IsOptional()
  isSuspended?: boolean;

  @IsString()
  @IsOptional()
  suspensionReason?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  roles?: string[]; // Array of role codes to assign

  @IsNumber()
  @IsOptional()
  fraudRiskScore?: number;
}
