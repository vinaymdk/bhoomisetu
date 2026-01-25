import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateBuyerRequirementDto } from './create-buyer-requirement.dto';
import { RequirementStatus } from '../entities/buyer-requirement.entity';

export class UpdateBuyerRequirementDto extends PartialType(CreateBuyerRequirementDto) {
  @IsEnum(RequirementStatus)
  @IsOptional()
  status?: RequirementStatus;
}
