import { IsOptional, IsEnum, IsDateString, IsNumber, Min, Max, IsString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentStatus } from '../../payments/entities/payment.entity';

export class PaymentReportFilterDto {
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsEnum(PaymentStatus)
  @IsOptional()
  status?: PaymentStatus;

  @IsString()
  @IsOptional()
  gateway?: string; // 'razorpay', 'stripe'

  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  fraudDetected?: boolean;

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
}
