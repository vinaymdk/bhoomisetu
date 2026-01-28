import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like, MoreThan, LessThanOrEqual, IsNull, MoreThanOrEqual } from 'typeorm';
import { BuyerRequirement, RequirementStatus, BudgetType } from './entities/buyer-requirement.entity';
import { PropertyRequirementMatch } from './entities/property-requirement-match.entity';
import { Property, PropertyStatus } from '../properties/entities/property.entity';
import { CreateBuyerRequirementDto } from './dto/create-buyer-requirement.dto';
import { UpdateBuyerRequirementDto } from './dto/update-buyer-requirement.dto';
import { BuyerRequirementFilterDto } from './dto/buyer-requirement-filter.dto';
import { BuyerRequirementResponseDto } from './dto/buyer-requirement-response.dto';
import { GeocodingService } from '../search/services/geocoding.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationPriority } from '../notifications/entities/notification.entity';
import { UsersService } from '../users/users.service';

export interface MatchResult {
  property: Property;
  match: PropertyRequirementMatch;
  budgetOverlapPercentage: number;
  locationMatchType: string;
  matchReasons: string[];
}

@Injectable()
export class BuyerRequirementsService {
  private readonly logger = new Logger(BuyerRequirementsService.name);

  constructor(
    @InjectRepository(BuyerRequirement)
    private readonly requirementRepository: Repository<BuyerRequirement>,
    @InjectRepository(PropertyRequirementMatch)
    private readonly matchRepository: Repository<PropertyRequirementMatch>,
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    private readonly geocodingService: GeocodingService,
    private readonly notificationsService: NotificationsService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Create a new buyer requirement
   */
  async create(buyerId: string, createDto: CreateBuyerRequirementDto): Promise<BuyerRequirementResponseDto> {
    // Normalize location if coordinates not provided
    let latitude = createDto.location.latitude;
    let longitude = createDto.location.longitude;

    if (!latitude || !longitude) {
      const locationQuery = `${createDto.location.city}, ${createDto.location.state}`;
      const geocoded = await this.geocodingService.normalizeLocation(locationQuery);
      if (geocoded?.location?.coordinates) {
        latitude = geocoded.location.coordinates.latitude;
        longitude = geocoded.location.coordinates.longitude;
      }
    }

    // Calculate expiry date if provided
    let expiresAt: Date | null = null;
    if (createDto.expiresInDays) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + createDto.expiresInDays);
    }

    const requirement = this.requirementRepository.create({
      buyerId,
      title: createDto.title,
      description: createDto.description,
      city: createDto.location.city,
      state: createDto.location.state,
      locality: createDto.location.locality,
      pincode: createDto.location.pincode,
      landmark: createDto.location.landmark,
      latitude,
      longitude,
      minBudget: createDto.minBudget,
      maxBudget: createDto.maxBudget,
      budgetType: createDto.budgetType || BudgetType.SALE,
      propertyType: createDto.propertyType,
      listingType: createDto.listingType,
      minArea: createDto.minArea,
      maxArea: createDto.maxArea,
      areaUnit: createDto.areaUnit || 'sqft',
      bedrooms: createDto.bedrooms,
      bathrooms: createDto.bathrooms,
      requiredFeatures: createDto.requiredFeatures,
      metadata: createDto.metadata,
      status: RequirementStatus.ACTIVE,
      expiresAt,
    });

    const savedRequirement = await this.requirementRepository.save(requirement);

    this.notificationsService
      .notifyActionAlert(buyerId, 'create', 'buyer requirement', {
        requirementId: savedRequirement.id,
        title: savedRequirement.title,
      })
      .catch(() => undefined);

    // Trigger AI matching against existing properties
    this.matchWithProperties(savedRequirement.id).catch((error) => {
      this.logger.error(`Error matching requirement ${savedRequirement.id}: ${error.message}`);
    });

    return BuyerRequirementResponseDto.fromEntity(savedRequirement);
  }

  /**
   * Find all buyer requirements (with filters)
   */
  async findAll(
    buyerId: string,
    filterDto: BuyerRequirementFilterDto,
  ): Promise<{
    requirements: BuyerRequirementResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const where: FindOptionsWhere<BuyerRequirement> = {
      buyerId, // Only show buyer's own requirements
      deletedAt: IsNull(),
    };

    if (filterDto.status) {
      where.status = filterDto.status;
    }
    if (filterDto.city) {
      where.city = filterDto.city;
    }
    if (filterDto.propertyType) {
      where.propertyType = filterDto.propertyType;
    }
    if (filterDto.listingType) {
      where.listingType = filterDto.listingType;
    }

    const page = filterDto.page || 1;
    const limit = filterDto.limit || 20;
    const skip = (page - 1) * limit;

    let query = this.requirementRepository
      .createQueryBuilder('requirement')
      .where(where)
      .orderBy('requirement.createdAt', 'DESC');

    if (filterDto.search) {
      query.andWhere(
        '(requirement.title ILIKE :search OR requirement.description ILIKE :search)',
        { search: `%${filterDto.search}%` },
      );
    }

    const [requirements, total] = await query.skip(skip).take(limit).getManyAndCount();

    return {
      requirements: requirements.map((r) => BuyerRequirementResponseDto.fromEntity(r)),
      total,
      page,
      limit,
    };
  }

  /**
   * Find one buyer requirement
   */
  async findOne(id: string, buyerId: string): Promise<BuyerRequirementResponseDto> {
    const requirement = await this.requirementRepository.findOne({
      where: { id, buyerId, deletedAt: IsNull() },
      relations: ['matches', 'matches.property'],
    });

    if (!requirement) {
      throw new NotFoundException('Buyer requirement not found');
    }

    return BuyerRequirementResponseDto.fromEntity(requirement);
  }

  /**
   * Update buyer requirement
   */
  async update(
    id: string,
    buyerId: string,
    updateDto: UpdateBuyerRequirementDto,
  ): Promise<BuyerRequirementResponseDto> {
    const requirement = await this.requirementRepository.findOne({
      where: { id, buyerId, deletedAt: IsNull() },
    });

    if (!requirement) {
      throw new NotFoundException('Buyer requirement not found');
    }

    if (requirement.status === RequirementStatus.FULFILLED) {
      throw new BadRequestException('Cannot update fulfilled requirement');
    }

    // Update fields
    if (updateDto.title !== undefined) requirement.title = updateDto.title;
    if (updateDto.description !== undefined) requirement.description = updateDto.description;
    if (updateDto.location) {
      requirement.city = updateDto.location.city;
      requirement.state = updateDto.location.state;
      requirement.locality = updateDto.location.locality;
      requirement.pincode = updateDto.location.pincode;
      requirement.landmark = updateDto.location.landmark;
      if (updateDto.location.latitude) requirement.latitude = updateDto.location.latitude;
      if (updateDto.location.longitude) requirement.longitude = updateDto.location.longitude;
    }
    if (updateDto.minBudget !== undefined) requirement.minBudget = updateDto.minBudget;
    if (updateDto.maxBudget !== undefined) requirement.maxBudget = updateDto.maxBudget;
    if (updateDto.budgetType) requirement.budgetType = updateDto.budgetType;
    if (updateDto.propertyType !== undefined) requirement.propertyType = updateDto.propertyType;
    if (updateDto.listingType !== undefined) requirement.listingType = updateDto.listingType;
    if (updateDto.minArea !== undefined) requirement.minArea = updateDto.minArea;
    if (updateDto.maxArea !== undefined) requirement.maxArea = updateDto.maxArea;
    if (updateDto.areaUnit) requirement.areaUnit = updateDto.areaUnit;
    if (updateDto.bedrooms !== undefined) requirement.bedrooms = updateDto.bedrooms;
    if (updateDto.bathrooms !== undefined) requirement.bathrooms = updateDto.bathrooms;
    if (updateDto.requiredFeatures !== undefined) requirement.requiredFeatures = updateDto.requiredFeatures;
    if (updateDto.metadata !== undefined) requirement.metadata = updateDto.metadata;
    if (updateDto.expiresInDays !== undefined) {
      const nextExpiry = new Date();
      nextExpiry.setDate(nextExpiry.getDate() + updateDto.expiresInDays);
      requirement.expiresAt = nextExpiry;
    }
    if (updateDto.status !== undefined) {
      if (requirement.status === RequirementStatus.FULFILLED) {
        throw new BadRequestException('Cannot update a fulfilled requirement');
      }
      requirement.status = updateDto.status;
    }

    const updated = await this.requirementRepository.save(requirement);

    this.notificationsService
      .notifyActionAlert(buyerId, 'update', 'buyer requirement', {
        requirementId: updated.id,
        title: updated.title,
      })
      .catch(() => undefined);

    // Re-match with properties if location or budget changed
    if (updateDto.location || updateDto.minBudget !== undefined || updateDto.maxBudget !== undefined) {
      this.matchWithProperties(id).catch((error) => {
        this.logger.error(`Error re-matching requirement ${id}: ${error.message}`);
      });
    }

    return BuyerRequirementResponseDto.fromEntity(updated);
  }

  /**
   * Delete buyer requirement (soft delete)
   */
  async remove(id: string, buyerId: string): Promise<void> {
    const requirement = await this.requirementRepository.findOne({
      where: { id, buyerId, deletedAt: IsNull() },
    });

    if (!requirement) {
      throw new NotFoundException('Buyer requirement not found');
    }

    requirement.deletedAt = new Date();
    requirement.status = RequirementStatus.CANCELLED;
    await this.requirementRepository.save(requirement);

    this.notificationsService
      .notifyActionAlert(buyerId, 'remove', 'buyer requirement', {
        requirementId: requirement.id,
        title: requirement.title,
      })
      .catch(() => undefined);
  }

  /**
   * AI Matching Logic: Match requirement with properties
   * CRITICAL: Location match + Budget overlap >= 80%
   */
  async matchWithRequirements(propertyId: string): Promise<MatchResult[]> {
    const property = await this.propertyRepository.findOne({
      where: { id: propertyId, status: PropertyStatus.LIVE, deletedAt: IsNull() },
      relations: ['seller'], // Load seller for notifications
    });

    if (!property) {
      throw new NotFoundException('Property not found or not live');
    }

    // Find active requirements that match location and listing type
    const requirements = await this.requirementRepository.find({
      where: {
        status: RequirementStatus.ACTIVE,
        city: property.city,
        listingType: property.listingType,
        deletedAt: IsNull(),
      },
    });

    // Filter out expired requirements (if expiresAt is set and in the past)
    const activeRequirements = requirements.filter(
      (req) => !req.expiresAt || req.expiresAt >= new Date(),
    );

    const matches: MatchResult[] = [];

    for (const requirement of activeRequirements) {
      const matchResult = this.calculateMatch(requirement, property);
      
      // CRITICAL: Only match if location matches AND budget overlap >= 80%
      if (matchResult.locationMatchType && matchResult.budgetOverlapPercentage >= 80) {
        // Check if match already exists
        let match = await this.matchRepository.findOne({
          where: {
            buyerRequirementId: requirement.id,
            propertyId: property.id,
          },
        });

        if (!match) {
          match = this.matchRepository.create({
            buyerRequirementId: requirement.id,
            propertyId: property.id,
            locationMatchScore: matchResult.locationMatchType === 'exact_city' ? 100 : 80,
            budgetMatchScore: matchResult.budgetOverlapPercentage,
            overallMatchScore: (matchResult.locationMatchType === 'exact_city' ? 100 : 80 + matchResult.budgetOverlapPercentage) / 2,
            budgetOverlapPercentage: matchResult.budgetOverlapPercentage,
            locationMatchType: matchResult.locationMatchType,
            matchReasons: matchResult.matchReasons,
          });
          match = await this.matchRepository.save(match);

          // Update requirement match count
          requirement.matchCount += 1;
          requirement.lastMatchedAt = new Date();
          await this.requirementRepository.save(requirement);

          // Trigger notifications: Notify buyer about new match
          this.notificationsService
            .notifyPropertyMatch(requirement.buyerId, property.id, matchResult.budgetOverlapPercentage)
            .catch((error) => {
              this.logger.error(`Failed to send property match notification: ${error.message}`);
            });

          // Notify seller about match (CRITICAL: without revealing buyer contact)
          if (property.sellerId) {
            this.notificationsService
              .notifyInterestExpression(property.sellerId, requirement.buyerId, property.id)
              .catch((error) => {
                this.logger.error(`Failed to send seller notification: ${error.message}`);
              });
          }

          // Notify CS agents about match
          try {
            const csAgents = await this.usersService.findByRole('customer_service');
            if (csAgents.length > 0) {
              const notificationPromises = csAgents.map((agent) =>
                this.notificationsService
                  .notifyCsFollowup(
                    agent.id,
                    `New match found: Requirement ${requirement.id} matched with Property ${property.id}. Match score: ${Math.round(matchResult.budgetOverlapPercentage)}%. Please review.`,
                    NotificationPriority.NORMAL as any,
                  )
                  .catch((error) => {
                    this.logger.error(`Failed to notify CS agent ${agent.id}: ${error.message}`);
                  }),
              );
              await Promise.allSettled(notificationPromises);
            }
            this.logger.log(
              `Match found: Requirement ${requirement.id} matched with Property ${property.id}. Budget overlap: ${matchResult.budgetOverlapPercentage}%. Buyer, Seller, and CS notified.`,
            );
          } catch (error: any) {
            this.logger.error(`Error in match notification: ${error.message}`);
          }
        }

        matches.push({
          property,
          match,
          ...matchResult,
        });
      }
    }

    return matches;
  }

  /**
   * Match requirement with existing properties
   * Called when a new requirement is created
   */
  async matchWithProperties(requirementId: string): Promise<MatchResult[]> {
    const requirement = await this.requirementRepository.findOne({
      where: { id: requirementId },
    });

    if (!requirement || requirement.status !== RequirementStatus.ACTIVE) {
      return [];
    }

    // Find LIVE properties that match location and listing type
    const where: FindOptionsWhere<Property> = {
      status: PropertyStatus.LIVE,
      city: requirement.city,
      deletedAt: IsNull(),
    };
    if (requirement.listingType) {
      where.listingType = requirement.listingType;
    }
    const properties = await this.propertyRepository.find({
      where,
      relations: ['seller'], // Load seller for notifications
    });

    const matches: MatchResult[] = [];

    for (const property of properties) {
      const matchResult = this.calculateMatch(requirement, property);

      // CRITICAL: Only match if location matches AND budget overlap >= 80%
      if (matchResult.locationMatchType && matchResult.budgetOverlapPercentage >= 80) {
        // Check if match already exists
        let match = await this.matchRepository.findOne({
          where: {
            buyerRequirementId: requirement.id,
            propertyId: property.id,
          },
        });

        if (!match) {
          match = this.matchRepository.create({
            buyerRequirementId: requirement.id,
            propertyId: property.id,
            locationMatchScore: matchResult.locationMatchType === 'exact_city' ? 100 : 80,
            budgetMatchScore: matchResult.budgetOverlapPercentage,
            overallMatchScore: (matchResult.locationMatchType === 'exact_city' ? 100 : 80 + matchResult.budgetOverlapPercentage) / 2,
            budgetOverlapPercentage: matchResult.budgetOverlapPercentage,
            locationMatchType: matchResult.locationMatchType,
            matchReasons: matchResult.matchReasons,
          });
          match = await this.matchRepository.save(match);

          // Update requirement match count
          requirement.matchCount += 1;
          requirement.lastMatchedAt = new Date();
          await this.requirementRepository.save(requirement);

          // Trigger notifications: Notify buyer about new match
          this.notificationsService
            .notifyPropertyMatch(requirement.buyerId, property.id, matchResult.budgetOverlapPercentage)
            .catch((error) => {
              this.logger.error(`Failed to send property match notification: ${error.message}`);
            });

          // Notify seller about match (CRITICAL: without revealing buyer contact)
          if (property.sellerId) {
            this.notificationsService
              .notifyInterestExpression(property.sellerId, requirement.buyerId, property.id)
              .catch((error) => {
                this.logger.error(`Failed to send seller notification: ${error.message}`);
              });
          }

          // Notify CS agents about match
          try {
            const csAgents = await this.usersService.findByRole('customer_service');
            if (csAgents.length > 0) {
              const notificationPromises = csAgents.map((agent) =>
                this.notificationsService
                  .notifyCsFollowup(
                    agent.id,
                    `New match found: Requirement ${requirement.id} matched with Property ${property.id}. Match score: ${Math.round(matchResult.budgetOverlapPercentage)}%. Please review.`,
                    NotificationPriority.NORMAL as any,
                  )
                  .catch((error) => {
                    this.logger.error(`Failed to notify CS agent ${agent.id}: ${error.message}`);
                  }),
              );
              await Promise.allSettled(notificationPromises);
            }
            this.logger.log(
              `Match found: Requirement ${requirement.id} matched with Property ${property.id}. Budget overlap: ${matchResult.budgetOverlapPercentage}%. Buyer, Seller, and CS notified.`,
            );
          } catch (error: any) {
            this.logger.error(`Error in match notification: ${error.message}`);
          }
        }

        matches.push({
          property,
          match,
          ...matchResult,
        });
      }
    }

    return matches;
  }

  /**
   * Calculate match between requirement and property
   * Returns: budget overlap percentage, location match type, match reasons
   */
  private calculateMatch(
    requirement: BuyerRequirement,
    property: Property,
  ): {
    budgetOverlapPercentage: number;
    locationMatchType: string;
    matchReasons: string[];
  } {
    const reasons: string[] = [];

    // 1. Location Matching
    let locationMatchType = '';
    if (requirement.city === property.city) {
      if (requirement.locality && property.locality && requirement.locality === property.locality) {
        locationMatchType = 'exact_locality';
        reasons.push('Same locality');
      } else {
        locationMatchType = 'exact_city';
        reasons.push('Same city');
      }
    } else {
      // No location match
      return {
        budgetOverlapPercentage: 0,
        locationMatchType: '',
        matchReasons: [],
      };
    }

    // 2. Budget Overlap Calculation
    // CRITICAL: Budget overlap >= 80% means the requirement budget range should overlap
    // with the property price range (with ±20% tolerance for flexibility)
    const reqMinBudget = requirement.minBudget || 0;
    const reqMaxBudget = parseFloat(requirement.maxBudget.toString());
    const propertyPrice = parseFloat(property.price.toString());

    // Calculate budget overlap percentage
    // Method: Check if property price is within requirement range (±20% tolerance)
    // OR if requirement range overlaps significantly with property price range
    let budgetOverlapPercentage = 0;

    // Property price with ±20% tolerance
    const propertyMinPrice = propertyPrice * 0.8; // 80% of property price (seller might negotiate down)
    const propertyMaxPrice = propertyPrice * 1.2; // 120% of property price (buyer might pay more)

    // Calculate overlap between requirement range and property price range
    const overlapStart = Math.max(reqMinBudget, propertyMinPrice);
    const overlapEnd = Math.min(reqMaxBudget, propertyMaxPrice);
    const overlapRange = Math.max(0, overlapEnd - overlapStart);
    const requirementRange = reqMaxBudget - reqMinBudget || reqMaxBudget;

    if (requirementRange > 0) {
      // Calculate overlap as percentage of requirement range
      budgetOverlapPercentage = (overlapRange / requirementRange) * 100;
    } else {
      // Single budget point (no range) - check if property is within ±20%
      if (propertyPrice >= reqMaxBudget * 0.8 && propertyPrice <= reqMaxBudget * 1.2) {
        budgetOverlapPercentage = 100;
      } else {
        // Calculate distance from requirement
        const distance = Math.abs(propertyPrice - reqMaxBudget);
        const tolerance = reqMaxBudget * 0.2; // 20% tolerance
        budgetOverlapPercentage = Math.max(0, (1 - distance / tolerance) * 100);
      }
    }

    // CRITICAL: Only match if budget overlap >= 80%
    if (budgetOverlapPercentage >= 80) {
      reasons.push(`Budget overlap: ${budgetOverlapPercentage.toFixed(1)}%`);
    } else {
      // Budget overlap is less than 80% - no match
      return {
        budgetOverlapPercentage,
        locationMatchType: '',
        matchReasons: [],
      };
    }

    // 3. Additional matching factors (bonus points)
    if (requirement.propertyType && property.propertyType === requirement.propertyType) {
      reasons.push('Property type matches');
    }

    if (requirement.bedrooms && property.bedrooms && property.bedrooms >= requirement.bedrooms) {
      reasons.push('Bedrooms requirement met');
    }

    if (requirement.bathrooms && property.bathrooms && property.bathrooms >= requirement.bathrooms) {
      reasons.push('Bathrooms requirement met');
    }

    return {
      budgetOverlapPercentage: Math.min(100, Math.max(0, budgetOverlapPercentage)),
      locationMatchType,
      matchReasons: reasons,
    };
  }

  /**
   * Get matches for a requirement
   */
  async getMatches(requirementId: string, buyerId: string): Promise<MatchResult[]> {
    const requirement = await this.requirementRepository.findOne({
      where: { id: requirementId, buyerId, deletedAt: IsNull() },
    });

    if (!requirement) {
      throw new NotFoundException('Buyer requirement not found');
    }

    const matches = await this.matchRepository.find({
      where: { buyerRequirementId: requirementId },
      relations: ['property', 'property.seller', 'property.images'],
      order: { overallMatchScore: 'DESC' },
    });

    return matches.map((match) => ({
      property: match.property,
      match,
      budgetOverlapPercentage: match.budgetOverlapPercentage || 0,
      locationMatchType: match.locationMatchType || '',
      matchReasons: match.matchReasons || [],
    }));
  }
}
