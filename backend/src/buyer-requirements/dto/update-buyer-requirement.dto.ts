import { PartialType } from '@nestjs/mapped-types';
import { CreateBuyerRequirementDto } from './create-buyer-requirement.dto';

export class UpdateBuyerRequirementDto extends PartialType(CreateBuyerRequirementDto) {}
