import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { BuyerRequirementsService } from './buyer-requirements.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CurrentUserData } from '../auth/decorators/current-user.decorator';
import { CreateBuyerRequirementDto } from './dto/create-buyer-requirement.dto';
import { UpdateBuyerRequirementDto } from './dto/update-buyer-requirement.dto';
import { BuyerRequirementFilterDto } from './dto/buyer-requirement-filter.dto';

@Controller('buyer-requirements')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('buyer', 'admin')
export class BuyerRequirementsController {
  constructor(private readonly buyerRequirementsService: BuyerRequirementsService) {}

  /**
   * Create a new buyer requirement
   * POST /api/buyer-requirements
   */
  @Post()
  create(
    @CurrentUser() currentUser: CurrentUserData,
    @Body() createDto: CreateBuyerRequirementDto,
  ) {
    return this.buyerRequirementsService.create(currentUser.userId, createDto);
  }

  /**
   * Get all buyer requirements (filtered)
   * GET /api/buyer-requirements
   */
  @Get()
  findAll(
    @CurrentUser() currentUser: CurrentUserData,
    @Query() filterDto: BuyerRequirementFilterDto,
  ) {
    return this.buyerRequirementsService.findAll(currentUser.userId, filterDto);
  }

  /**
   * Get a specific buyer requirement
   * GET /api/buyer-requirements/:id
   */
  @Get(':id')
  findOne(
    @CurrentUser() currentUser: CurrentUserData,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.buyerRequirementsService.findOne(id, currentUser.userId);
  }

  /**
   * Update a buyer requirement
   * PUT /api/buyer-requirements/:id
   */
  @Put(':id')
  update(
    @CurrentUser() currentUser: CurrentUserData,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateBuyerRequirementDto,
  ) {
    return this.buyerRequirementsService.update(id, currentUser.userId, updateDto);
  }

  /**
   * Delete a buyer requirement
   * DELETE /api/buyer-requirements/:id
   */
  @Delete(':id')
  remove(
    @CurrentUser() currentUser: CurrentUserData,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.buyerRequirementsService.remove(id, currentUser.userId);
  }

  /**
   * Get matches for a buyer requirement
   * GET /api/buyer-requirements/:id/matches
   */
  @Get(':id/matches')
  getMatches(
    @CurrentUser() currentUser: CurrentUserData,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.buyerRequirementsService.getMatches(id, currentUser.userId);
  }
}
