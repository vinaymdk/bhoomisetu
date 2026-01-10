import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PropertyFilterDto } from './dto/property-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';
import { PropertyResponseDto } from './dto/property-response.dto';

@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller', 'agent')
  async create(
    @CurrentUser() currentUser: CurrentUserData,
    @Body() createDto: CreatePropertyDto,
  ): Promise<PropertyResponseDto> {
    return this.propertiesService.create(currentUser.userId, createDto);
  }

  @Get()
  async findAll(@Query() filterDto: PropertyFilterDto): Promise<{
    properties: PropertyResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.propertiesService.findAll(filterDto);
  }

  @Get('featured')
  async findFeatured(@Query('limit') limit?: number): Promise<PropertyResponseDto[]> {
    return this.propertiesService.findFeatured(limit ? parseInt(limit.toString(), 10) : 10);
  }

  @Get('new')
  async findNew(@Query('limit') limit?: number): Promise<PropertyResponseDto[]> {
    return this.propertiesService.findNew(limit ? parseInt(limit.toString(), 10) : 10);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller', 'agent')
  async findMyProperties(
    @CurrentUser() currentUser: CurrentUserData,
    @Query('status') status?: string,
  ): Promise<PropertyResponseDto[]> {
    return this.propertiesService.findMyProperties(currentUser.userId, status as any);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() currentUser?: CurrentUserData,
  ): Promise<PropertyResponseDto> {
    const property = await this.propertiesService.findOne(id, currentUser?.userId, false);
    return PropertyResponseDto.fromEntity(property);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller', 'agent')
  async update(
    @Param('id') id: string,
    @CurrentUser() currentUser: CurrentUserData,
    @Body() updateDto: UpdatePropertyDto,
  ): Promise<PropertyResponseDto> {
    return this.propertiesService.update(id, currentUser.userId, updateDto);
  }

  @Post(':id/submit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller', 'agent')
  @HttpCode(HttpStatus.OK)
  async submitForVerification(
    @Param('id') id: string,
    @CurrentUser() currentUser: CurrentUserData,
  ): Promise<PropertyResponseDto> {
    return this.propertiesService.submitForVerification(id, currentUser.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller', 'agent')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @CurrentUser() currentUser: CurrentUserData): Promise<void> {
    return this.propertiesService.remove(id, currentUser.userId);
  }
}
