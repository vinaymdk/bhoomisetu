import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class SentimentAnalysisRequestDto {
  @IsString()
  @IsNotEmpty()
  reviewText: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  pros?: string;

  @IsString()
  @IsOptional()
  cons?: string;

  @IsNumber()
  @Min(1.0)
  @Max(5.0)
  rating: number;

  @IsString()
  @IsOptional()
  context?: string; // Review context (after_viewing, after_deal, after_interaction)
}
