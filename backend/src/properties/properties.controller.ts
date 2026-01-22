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
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PropertyFilterDto } from './dto/property-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';
import { PropertyResponseDto } from './dto/property-response.dto';
import { StorageService } from '../storage/storage.service';

@Controller('properties')
export class PropertiesController {
  constructor(
    private readonly propertiesService: PropertiesService,
    private readonly storageService: StorageService,
  ) {}

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
  @UseGuards(OptionalJwtAuthGuard)
  async findOne(
    @Param('id') id: string,
    @CurrentUser() currentUser?: CurrentUserData,
  ): Promise<PropertyResponseDto> {
    const includeDraft = !!currentUser?.userId;
    const property = await this.propertiesService.findOne(id, currentUser?.userId, includeDraft);
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

  /**
   * Upload property images
   * POST /api/properties/images/upload
   * Accepts multiple image files (max 20)
   * Returns array of uploaded image URLs and metadata
   */
  @Post('images/upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller', 'agent')
  @UseInterceptors(FilesInterceptor('images', 20, { limits: { fileSize: 10 * 1024 * 1024 } })) // Max 20 files, 10MB each
  async uploadImages(
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<{
    images: Array<{
      url: string;
      publicId: string;
      width?: number;
      height?: number;
      format?: string;
      bytes?: number;
    }>;
  }> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const uploadResults = await this.storageService.uploadImages(files, 'bhoomisetu/properties');

    return {
      images: uploadResults.map((result) => ({
        url: result.url,
        publicId: result.publicId,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      })),
    };
  }
}
