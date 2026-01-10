import { IsEnum, IsString, IsOptional, IsNotEmpty, MaxLength } from 'class-validator';
import { ReportReason } from '../entities/review-report.entity';

export class ReportReviewDto {
  @IsEnum(ReportReason)
  @IsNotEmpty()
  reportReason: ReportReason;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  reportDetails?: string;
}
