import { IsUUID, IsNotEmpty, IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class ApproveConnectionDto {
  @IsUUID()
  @IsNotEmpty()
  interestExpressionId!: string;

  @IsBoolean()
  @IsOptional()
  revealSellerContact?: boolean = true; // Default: reveal seller contact after approval

  @IsBoolean()
  @IsOptional()
  revealBuyerContact?: boolean = true; // Default: reveal buyer contact after approval

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  notes?: string;

  @IsString()
  @IsOptional()
  @MaxLength(5000)
  internalNotes?: string;
}
