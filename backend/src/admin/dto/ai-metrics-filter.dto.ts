import { IsOptional, IsDateString, IsEnum, IsString } from 'class-validator';

export enum AiMetricType {
  FRAUD_DETECTION = 'fraud_detection',
  SENTIMENT_ANALYSIS = 'sentiment_analysis',
  FAKE_REVIEW_DETECTION = 'fake_review_detection',
  DUPLICATE_DETECTION = 'duplicate_detection',
  SESSION_RISK = 'session_risk',
}

export class AiMetricsFilterDto {
  @IsEnum(AiMetricType)
  @IsOptional()
  metricType?: AiMetricType;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  aggregation?: 'daily' | 'weekly' | 'monthly'; // Group by period
}
