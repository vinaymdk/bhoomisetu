import { PartialType } from '@nestjs/mapped-types';
import { CreateReviewDto } from './create-review.dto';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateReviewDto extends PartialType(CreateReviewDto) {
  @IsString()
  @IsOptional()
  @MaxLength(5000)
  comment?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  pros?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  cons?: string;
}
