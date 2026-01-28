import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like, In, IsNull } from 'typeorm';
import { Property, PropertyStatus } from '../properties/entities/property.entity';
import { PropertyVerificationNote, UrgencyLevel } from '../properties/entities/property-verification-note.entity';
import { User } from '../users/entities/user.entity';
import { VerifyPropertyDto } from './dto/verify-property.dto';
import { PendingVerificationFilterDto } from './dto/pending-verification-filter.dto';
import { UsersService } from '../users/users.service';
import { BuyerRequirementsService } from '../buyer-requirements/buyer-requirements.service';
import { NotificationsService } from '../notifications/notifications.service';

export interface PendingVerificationProperty {
  property: Property;
  seller: {
    id: string;
    fullName: string | null | undefined;
    primaryPhone: string | null | undefined;
    primaryEmail: string | null | undefined;
  };
  verificationNotes?: PropertyVerificationNote[];
}

@Injectable()
export class CustomerServiceService {
  private readonly logger = new Logger(CustomerServiceService.name);

  constructor(
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    @InjectRepository(PropertyVerificationNote)
    private readonly verificationNoteRepository: Repository<PropertyVerificationNote>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => BuyerRequirementsService))
    private readonly buyerRequirementsService: BuyerRequirementsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Get pending properties for verification (CS dashboard)
   */
  async getPendingVerifications(
    csAgentId: string,
    filterDto: PendingVerificationFilterDto,
  ): Promise<{
    properties: PendingVerificationProperty[];
    total: number;
    page: number;
    limit: number;
  }> {
    // Verify CS agent has customer_service role
    const roles = await this.usersService.getUserRoles(csAgentId);
    if (!roles.includes('customer_service') && !roles.includes('admin')) {
      throw new ForbiddenException('Only customer service agents can access this endpoint');
    }

    const where: FindOptionsWhere<Property> = {
      status: filterDto.status || PropertyStatus.PENDING_VERIFICATION,
      deletedAt: IsNull(),
    };

    // Apply filters
    if (filterDto.city) {
      where.city = filterDto.city;
    }
    if (filterDto.propertyType) {
      where.propertyType = filterDto.propertyType as any;
    }

    const queryBuilder = this.propertyRepository
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.seller', 'seller')
      .leftJoinAndSelect('property.verificationNotes', 'verificationNotes')
      .leftJoinAndSelect('verificationNotes.csAgent', 'csAgent')
      .where('property.deletedAt IS NULL');

    // Apply status filter
    if (where.status) {
      queryBuilder.andWhere('property.status = :status', { status: where.status });
    }

    // Apply city filter
    if (where.city) {
      queryBuilder.andWhere('property.city ILIKE :city', { city: `%${where.city.trim()}%` });
    }

    // Apply property type filter
    if (where.propertyType) {
      queryBuilder.andWhere('property.propertyType = :propertyType', {
        propertyType: where.propertyType,
      });
    }

    // Apply search filter
    if (filterDto.search) {
      queryBuilder.andWhere(
        '(property.title ILIKE :search OR property.description ILIKE :search OR property.address ILIKE :search)',
        { search: `%${filterDto.search}%` },
      );
    }

    // Apply urgency level filter (on latest verification note)
    if (filterDto.urgencyLevel) {
      queryBuilder.andWhere('verificationNotes.urgencyLevel = :urgencyLevel', {
        urgencyLevel: filterDto.urgencyLevel,
      });
    }

    const page = filterDto.page || 1;
    const limit = filterDto.limit || 20;
    const skip = (page - 1) * limit;

    const [properties, total] = await queryBuilder
      .orderBy('property.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const result: PendingVerificationProperty[] = properties.map((property) => ({
      property,
      seller: {
        id: property.seller.id,
        fullName: property.seller.fullName,
        primaryPhone: property.seller.primaryPhone,
        primaryEmail: property.seller.primaryEmail,
      },
      verificationNotes: property.verificationNotes || [],
    }));

    return {
      properties: result,
      total,
      page,
      limit,
    };
  }

  /**
   * Get a single property for verification with full details
   */
  async getPropertyForVerification(
    csAgentId: string,
    propertyId: string,
  ): Promise<PendingVerificationProperty> {
    // Verify CS agent has customer_service role
    const roles = await this.usersService.getUserRoles(csAgentId);
    if (!roles.includes('customer_service') && !roles.includes('admin')) {
      throw new ForbiddenException('Only customer service agents can access this endpoint');
    }

    const property = await this.propertyRepository.findOne({
      where: { id: propertyId },
      relations: ['seller', 'images', 'propertyFeatures', 'verificationNotes', 'verificationNotes.csAgent'],
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    return {
      property,
      seller: {
        id: property.seller.id,
        fullName: property.seller.fullName,
        primaryPhone: property.seller.primaryPhone,
        primaryEmail: property.seller.primaryEmail,
      },
      verificationNotes: property.verificationNotes || [],
    };
  }

  /**
   * Verify a property (approve or reject)
   * This is the CRITICAL workflow step that moves property from pending → verified → live
   */
  async verifyProperty(csAgentId: string, verifyDto: VerifyPropertyDto): Promise<Property> {
    // Verify CS agent has customer_service role
    const roles = await this.usersService.getUserRoles(csAgentId);
    if (!roles.includes('customer_service') && !roles.includes('admin')) {
      throw new ForbiddenException('Only customer service agents can verify properties');
    }

    // Find property
    const property = await this.propertyRepository.findOne({
      where: { id: verifyDto.propertyId },
      relations: ['seller'],
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    // Only verify properties in pending_verification status
    if (property.status !== PropertyStatus.PENDING_VERIFICATION) {
      throw new BadRequestException(
        `Property is in ${property.status} status. Only properties in pending_verification can be verified.`,
      );
    }

    // Validate rejection reason if rejecting
    if (verifyDto.action === 'reject' && !verifyDto.rejectionReason) {
      throw new BadRequestException('Rejection reason is required when rejecting a property');
    }

    // Create verification note
    const verificationNote = this.verificationNoteRepository.create({
      propertyId: property.id,
      csAgentId,
      urgencyLevel: verifyDto.urgencyLevel,
      negotiationNotes: verifyDto.negotiationNotes || null,
      remarks: verifyDto.remarks || null,
      verifiedAt: new Date(),
    });

    await this.verificationNoteRepository.save(verificationNote);

    // Update property status based on action
    if (verifyDto.action === 'approve') {
      // CRITICAL WORKFLOW: pending_verification → LIVE (after CS verification)
      // This is the ONLY way a property can become LIVE - through CS verification
      property.status = PropertyStatus.LIVE;
      property.verifiedAt = new Date();
      property.verifiedBy = csAgentId;
      property.rejectionReason = null;

      // Note: Properties can be marked as VERIFIED (intermediate state) if needed
      // For now, approved properties go directly to LIVE (visible to buyers)
    } else {
      // Reject property - seller can edit and resubmit
      property.status = PropertyStatus.REJECTED;
      property.rejectionReason = verifyDto.rejectionReason || 'Rejected by customer service';
      // Note: Seller can edit rejected properties (status goes back to DRAFT) and resubmit (PENDING_VERIFICATION)
    }

    const updatedProperty = await this.propertyRepository.save(property);

    this.logger.log(
      `Property ${property.id} ${verifyDto.action === 'approve' ? 'approved' : 'rejected'} by CS agent ${csAgentId}`,
    );

    this.notificationsService
      .notifyActionAlert(property.sellerId, verifyDto.action, 'property verification', {
        propertyId: property.id,
        status: property.status,
      })
      .catch(() => undefined);

    // Trigger AI matching when property goes LIVE (Module 6)
    if (verifyDto.action === 'approve' && updatedProperty.status === PropertyStatus.LIVE) {
      this.buyerRequirementsService
        .matchWithRequirements(updatedProperty.id)
        .then((matches) => {
          if (matches.length > 0) {
            this.logger.log(
              `Property ${updatedProperty.id} matched with ${matches.length} buyer requirement(s). Notifications will be sent.`,
            );
            // Notify seller about match (without revealing buyer contact)
            // Note: Seller notification handled in buyer-requirements service when match is created
            // CS agents can view matches in their dashboard
          }
        })
        .catch((error) => {
          this.logger.error(`Error matching property ${updatedProperty.id} with requirements: ${error.message}`);
        });
    }

    return updatedProperty;
  }

  /**
   * Re-assign a property to a different CS agent (for load balancing)
   */
  async reassignProperty(
    adminId: string,
    propertyId: string,
    newCsAgentId: string,
  ): Promise<Property> {
    // Verify admin role
    const roles = await this.usersService.getUserRoles(adminId);
    if (!roles.includes('admin')) {
      throw new ForbiddenException('Only admins can reassign properties');
    }

    // Verify new CS agent has customer_service role
    const newAgentRoles = await this.usersService.getUserRoles(newCsAgentId);
    if (!newAgentRoles.includes('customer_service')) {
      throw new BadRequestException('Target user must have customer_service role');
    }

    const property = await this.propertyRepository.findOne({
      where: { id: propertyId },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    // Create a note about reassignment
    const reassignmentNote = this.verificationNoteRepository.create({
      propertyId: property.id,
      csAgentId: adminId,
      urgencyLevel: UrgencyLevel.NORMAL,
      remarks: `Property reassigned to CS agent ${newCsAgentId} by admin ${adminId}`,
      verifiedAt: new Date(),
    });

    await this.verificationNoteRepository.save(reassignmentNote);

    return property;
  }

  /**
   * Get CS agent statistics (for dashboard)
   */
  async getCsAgentStats(csAgentId: string): Promise<{
    pending: number;
    verified: number;
    rejected: number;
    total: number;
  }> {
    const roles = await this.usersService.getUserRoles(csAgentId);
    if (!roles.includes('customer_service') && !roles.includes('admin')) {
      throw new ForbiddenException('Only customer service agents can access this endpoint');
    }

    const [pending, verified, rejected] = await Promise.all([
      this.propertyRepository.count({
        where: { status: PropertyStatus.PENDING_VERIFICATION, deletedAt: IsNull() },
      }),
      this.propertyRepository.count({
        where: { status: PropertyStatus.LIVE, deletedAt: IsNull() },
      }),
      this.propertyRepository.count({
        where: { status: PropertyStatus.REJECTED, deletedAt: IsNull() },
      }),
    ]);
    const total = pending + verified + rejected;

    return {
      pending,
      verified,
      rejected,
      total,
    };
  }
}
