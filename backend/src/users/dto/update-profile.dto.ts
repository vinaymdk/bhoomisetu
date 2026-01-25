import { IsEmail, IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  fullName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(32)
  primaryPhone?: string;

  @ValidateIf((_, value) => value !== undefined && value !== null && value !== '')
  @IsEmail()
  @IsOptional()
  @MaxLength(255)
  primaryEmail?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  address?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  avatarUrl?: string;
}

