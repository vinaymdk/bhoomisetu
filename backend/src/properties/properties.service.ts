import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Between, LessThanOrEqual, MoreThanOrEqual, IsNull } from 'typeorm';
import { Property, PropertyStatus } from './entities/property.entity';
import { PropertyImage } from './entities/property-image.entity';
import { PropertyFeature } from './entities/property-feature.entity';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PropertyFilterDto } from './dto/property-filter.dto';
import { PropertyResponseDto } from './dto/property-response.dto';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    @InjectRepository(PropertyImage)
    private readonly propertyImageRepository: Repository<PropertyImage>,
    @InjectRepository(PropertyFeature)
    private readonly propertyFeatureRepository: Repository<PropertyFeature>,
    @Inject(forwardRef(() => SubscriptionsService))
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  async create(userId: string, createDto: CreatePropertyDto): Promise<PropertyResponseDto> {
    // Create property entity
    // CRITICAL: Properties always start as DRAFT and must go through CS verification before going LIVE
    const property = this.propertyRepository.create({
      sellerId: userId,
      propertyType: createDto.propertyType,
      listingType: createDto.listingType,
      status: PropertyStatus.DRAFT, // Always start as draft, then submit for verification
      address: createDto.location.address,
      city: createDto.location.city,
      state: createDto.location.state,
      pincode: createDto.location.pincode,
      locality: createDto.location.locality,
      landmark: createDto.location.landmark,
      latitude: createDto.location.latitude,
      longitude: createDto.location.longitude,
      title: createDto.title,
      description: createDto.description,
      price: createDto.price,
      area: createDto.area,
      areaUnit: createDto.areaUnit || 'sqft',
      bedrooms: createDto.bedrooms,
      bathrooms: createDto.bathrooms,
      balconies: createDto.balconies,
      floors: createDto.floors,
      floorNumber: createDto.floorNumber,
      furnishingStatus: createDto.furnishingStatus,
      ageOfConstruction: createDto.ageOfConstruction,
      features: createDto.features,
    });

    // Check if seller has premium seller subscription for priority listing
    const hasPremiumSeller = await this.subscriptionsService.hasPremiumSellerFeatures(userId);
    if (hasPremiumSeller) {
      property.isPremium = true;
    }

    const savedProperty = await this.propertyRepository.save(property);

    // Save images if provided
    if (createDto.images && createDto.images.length > 0) {
      const images = createDto.images.map((img, index) =>
        this.propertyImageRepository.create({
          propertyId: savedProperty.id,
          imageUrl: img.imageUrl,
          imageType: img.imageType || 'photo',
          displayOrder: img.displayOrder ?? index,
          isPrimary: img.isPrimary ?? index === 0,
        }),
      );
      await this.propertyImageRepository.save(images);
    }

    // Save structured features if provided
    if (createDto.featureKeys && createDto.featureKeys.length > 0) {
      const features = createDto.featureKeys.map((key) =>
        this.propertyFeatureRepository.create({
          propertyId: savedProperty.id,
          featureKey: key,
        }),
      );
      await this.propertyFeatureRepository.save(features);
    }

    // Reload with relations
    return PropertyResponseDto.fromEntity(
      await this.findOne(savedProperty.id, userId, true),
    );
  }

  async findAll(
    filterDto: PropertyFilterDto,
    userId?: string,
  ): Promise<{ properties: PropertyResponseDto[]; total: number; page: number; limit: number }> {
    const where: FindOptionsWhere<Property> = {
      status: filterDto.status || PropertyStatus.LIVE, // Only show live properties by default
      deletedAt: IsNull(),
    };

    // Apply filters
    if (filterDto.listingType) {
      where.listingType = filterDto.listingType;
    }
    if (filterDto.propertyType) {
      where.propertyType = filterDto.propertyType;
    }
    if (filterDto.city) {
      where.city = filterDto.city;
    }
    if (filterDto.state) {
      where.state = filterDto.state;
    }
    if (filterDto.locality) {
      where.locality = filterDto.locality;
    }
    if (filterDto.isFeatured !== undefined) {
      where.isFeatured = filterDto.isFeatured;
    }

    const queryBuilder = this.propertyRepository
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.images', 'images')
      .leftJoinAndSelect('property.propertyFeatures', 'features')
      .where(where);

    // Price range
    if (filterDto.minPrice !== undefined || filterDto.maxPrice !== undefined) {
      if (filterDto.minPrice !== undefined && filterDto.maxPrice !== undefined) {
        queryBuilder.andWhere('property.price BETWEEN :minPrice AND :maxPrice', {
          minPrice: filterDto.minPrice,
          maxPrice: filterDto.maxPrice,
        });
      } else if (filterDto.minPrice !== undefined) {
        queryBuilder.andWhere('property.price >= :minPrice', { minPrice: filterDto.minPrice });
      } else if (filterDto.maxPrice !== undefined) {
        queryBuilder.andWhere('property.price <= :maxPrice', { maxPrice: filterDto.maxPrice });
      }
    }

    // Area range
    if (filterDto.minArea !== undefined || filterDto.maxArea !== undefined) {
      if (filterDto.minArea !== undefined && filterDto.maxArea !== undefined) {
        queryBuilder.andWhere('property.area BETWEEN :minArea AND :maxArea', {
          minArea: filterDto.minArea,
          maxArea: filterDto.maxArea,
        });
      } else if (filterDto.minArea !== undefined) {
        queryBuilder.andWhere('property.area >= :minArea', { minArea: filterDto.minArea });
      } else if (filterDto.maxArea !== undefined) {
        queryBuilder.andWhere('property.area <= :maxArea', { maxArea: filterDto.maxArea });
      }
    }

    // Bedrooms
    if (filterDto.bedrooms !== undefined) {
      queryBuilder.andWhere('property.bedrooms = :bedrooms', { bedrooms: filterDto.bedrooms });
    }

    // Bathrooms
    if (filterDto.bathrooms !== undefined) {
      queryBuilder.andWhere('property.bathrooms = :bathrooms', { bathrooms: filterDto.bathrooms });
    }

    // Priority listing: Premium seller properties always appear first (regardless of viewer)
    // Sort order: Premium properties -> Featured properties -> By user-specified sortBy
    queryBuilder.orderBy('property.isPremium', 'DESC'); // Premium seller properties first
    queryBuilder.addOrderBy('property.isFeatured', 'DESC'); // Then featured properties
    const sortBy = filterDto.sortBy || 'createdAt';
    const sortOrder = filterDto.sortOrder || 'DESC';
    queryBuilder.addOrderBy(`property.${sortBy}`, sortOrder); // Finally by user-specified sort

    // Pagination
    const page = filterDto.page || 1;
    const limit = filterDto.limit || 20;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);

    const [properties, total] = await queryBuilder.getManyAndCount();

    return {
      properties: properties.map((p) => PropertyResponseDto.fromEntity(p)),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string, userId?: string, includeDraft: boolean = false): Promise<Property> {
    const where: FindOptionsWhere<Property> = { id, deletedAt: IsNull() };

    // If not owner, only show live properties
    if (!includeDraft) {
      where.status = PropertyStatus.LIVE;
    }

    const property = await this.propertyRepository.findOne({
      where,
      relations: ['images', 'propertyFeatures', 'seller'],
    });

    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }

    // If draft, only owner can view
    if (property.status === PropertyStatus.DRAFT && property.sellerId !== userId) {
      throw new ForbiddenException('You do not have access to this property');
    }

    // Increment view count if not owner viewing
    if (property.sellerId !== userId) {
      property.viewsCount += 1;
      await this.propertyRepository.save(property);
    }

    return property;
  }

  async findFeatured(limit: number = 10): Promise<PropertyResponseDto[]> {
    const properties = await this.propertyRepository.find({
      where: {
        status: PropertyStatus.LIVE,
        isFeatured: true,
        deletedAt: IsNull(),
      },
      relations: ['images', 'propertyFeatures'],
      order: { createdAt: 'DESC' },
      take: limit,
    });

    return properties.map((p) => PropertyResponseDto.fromEntity(p));
  }

  async findNew(limit: number = 10): Promise<PropertyResponseDto[]> {
    const properties = await this.propertyRepository.find({
      where: {
        status: PropertyStatus.LIVE,
        deletedAt: IsNull(),
      },
      relations: ['images', 'propertyFeatures'],
      order: { createdAt: 'DESC' },
      take: limit,
    });

    return properties.map((p) => PropertyResponseDto.fromEntity(p));
  }

  async update(id: string, userId: string, updateDto: UpdatePropertyDto): Promise<PropertyResponseDto> {
    const property = await this.propertyRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }

    // Only owner can update
    if (property.sellerId !== userId) {
      throw new ForbiddenException('You can only update your own properties');
    }

    // CRITICAL: Cannot update if already verified/live (only CS can change status after verification)
    // If seller needs to make changes, they must create a new listing or property goes back to DRAFT
    if (property.status === PropertyStatus.VERIFIED || property.status === PropertyStatus.LIVE) {
      // Reset to DRAFT when seller edits verified/live property - requires re-verification
      // This ensures all changes go through CS verification again
      property.status = PropertyStatus.DRAFT;
      property.verifiedAt = null;
      property.verifiedBy = null;
    }
    
    // Rejected properties can be edited (already in DRAFT or can be reset)
    if (property.status === PropertyStatus.REJECTED) {
      property.status = PropertyStatus.DRAFT;
      property.rejectionReason = null;
    }

    // Update fields
    if (updateDto.location) {
      Object.assign(property, {
        address: updateDto.location.address,
        city: updateDto.location.city,
        state: updateDto.location.state,
        pincode: updateDto.location.pincode,
        locality: updateDto.location.locality,
        landmark: updateDto.location.landmark,
        latitude: updateDto.location.latitude,
        longitude: updateDto.location.longitude,
      });
    }

    if (updateDto.title) property.title = updateDto.title;
    if (updateDto.description !== undefined) property.description = updateDto.description;
    if (updateDto.price) property.price = updateDto.price;
    if (updateDto.propertyType) property.propertyType = updateDto.propertyType;
    if (updateDto.listingType) property.listingType = updateDto.listingType;

    const updated = await this.propertyRepository.save(property);

    return PropertyResponseDto.fromEntity(await this.findOne(updated.id, userId, true));
  }

  async submitForVerification(id: string, userId: string): Promise<PropertyResponseDto> {
    const property = await this.propertyRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }

    if (property.sellerId !== userId) {
      throw new ForbiddenException('You can only submit your own properties');
    }

    if (property.status !== PropertyStatus.DRAFT) {
      throw new BadRequestException('Only draft properties can be submitted for verification');
    }

    // Validate required fields
    if (!property.images || property.images.length === 0) {
      throw new BadRequestException('At least one image is required');
    }

    property.status = PropertyStatus.PENDING_VERIFICATION;
    const updated = await this.propertyRepository.save(property);

    return PropertyResponseDto.fromEntity(await this.findOne(updated.id, userId, true));
  }

  async remove(id: string, userId: string): Promise<void> {
    const property = await this.propertyRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }

    if (property.sellerId !== userId) {
      throw new ForbiddenException('You can only delete your own properties');
    }

    // Soft delete
    property.deletedAt = new Date();
    await this.propertyRepository.save(property);
  }

  async findMyProperties(userId: string, status?: PropertyStatus): Promise<PropertyResponseDto[]> {
    const where: FindOptionsWhere<Property> = {
      sellerId: userId,
      deletedAt: IsNull(),
    };

    if (status) {
      where.status = status;
    }

    const properties = await this.propertyRepository.find({
      where,
      relations: ['images', 'propertyFeatures'],
      order: { createdAt: 'DESC' },
    });

    return properties.map((p) => PropertyResponseDto.fromEntity(p));
  }
}
