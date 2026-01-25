import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, IsNull, In } from 'typeorm';
import {
  InterestExpression,
  ConnectionStatus,
  InterestType,
  InterestPriority,
} from './entities/interest-expression.entity';
import {
  CsMediationAction,
  MediationActionType,
  MediationActionStatus,
  MediationOutcome,
} from './entities/cs-mediation-action.entity';
import { ChatSession, ChatSessionStatus } from './entities/chat-session.entity';
import { ChatMessage, MessageType } from './entities/chat-message.entity';
import { Property, PropertyStatus } from '../properties/entities/property.entity';
import { PropertyRequirementMatch } from '../buyer-requirements/entities/property-requirement-match.entity';
import { ExpressInterestDto } from './dto/express-interest.dto';
import { CsReviewInterestDto } from './dto/cs-review-interest.dto';
import { ApproveConnectionDto } from './dto/approve-connection.dto';
import { MediationFilterDto } from './dto/mediation-filter.dto';
import { UsersService } from '../users/users.service';
import { AiService } from '../ai/ai.service';
import { NotificationsService } from '../notifications/notifications.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { Inject, forwardRef } from '@nestjs/common';

@Injectable()
export class MediationService {
  private readonly logger = new Logger(MediationService.name);

  constructor(
    @InjectRepository(InterestExpression)
    private readonly interestExpressionRepository: Repository<InterestExpression>,
    @InjectRepository(CsMediationAction)
    private readonly mediationActionRepository: Repository<CsMediationAction>,
    @InjectRepository(ChatSession)
    private readonly chatSessionRepository: Repository<ChatSession>,
    @InjectRepository(ChatMessage)
    private readonly chatMessageRepository: Repository<ChatMessage>,
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    @InjectRepository(PropertyRequirementMatch)
    private readonly matchRepository: Repository<PropertyRequirementMatch>,
    private readonly usersService: UsersService,
    private readonly aiService: AiService,
    private readonly notificationsService: NotificationsService,
    @Inject(forwardRef(() => SubscriptionsService))
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  /**
   * Buyer expresses interest in a property
   * CRITICAL: This does NOT reveal seller contact. Only CS can approve connection.
   */
  async expressInterest(buyerId: string, expressDto: ExpressInterestDto): Promise<InterestExpression> {
    // Verify property exists and is LIVE
    const property = await this.propertyRepository.findOne({
      where: { id: expressDto.propertyId, status: PropertyStatus.LIVE, deletedAt: IsNull() },
      relations: ['seller'],
    });

    if (!property) {
      throw new NotFoundException('Property not found or not live');
    }

    // CRITICAL: Buyer cannot express interest in their own property
    if (property.sellerId === buyerId) {
      throw new ForbiddenException('You cannot express interest in your own property');
    }

    // Check if interest already expressed
    const existingInterest = await this.interestExpressionRepository.findOne({
      where: {
        buyerId,
        propertyId: expressDto.propertyId,
        deletedAt: IsNull(),
      },
    });

    if (existingInterest) {
      throw new BadRequestException('You have already expressed interest in this property');
    }

    // Verify match if matchId provided
    let match: PropertyRequirementMatch | null = null;
    if (expressDto.matchId) {
      match = await this.matchRepository.findOne({
        where: {
          id: expressDto.matchId,
          buyerRequirementId: buyerId, // Verify buyer owns the match
          propertyId: expressDto.propertyId,
        },
      });

      if (!match) {
        throw new NotFoundException('Match not found or does not belong to you');
      }

      // Update match to mark buyer interest
      match.buyerInterested = true;
      match.buyerInterestedAt = new Date();
      await this.matchRepository.save(match);
    }

    // Faster mediation: Premium users (buyer or seller) get HIGH priority
    let priority = expressDto.priority || InterestPriority.NORMAL;
    const hasPremiumBuyer = await this.subscriptionsService.hasPremiumBuyerFeatures(buyerId);
    if (hasPremiumBuyer) {
      priority = InterestPriority.HIGH; // Premium buyers get faster mediation
      this.logger.log(`Premium buyer ${buyerId} expressed interest - HIGH priority assigned`);
    }

    // Check if seller has premium seller subscription (for priority processing)
    // Property already fetched above, reuse it
    const hasPremiumSeller = await this.subscriptionsService.hasPremiumSellerFeatures(property.sellerId);
    if (hasPremiumSeller && priority === InterestPriority.NORMAL) {
      priority = InterestPriority.HIGH; // Premium seller gets faster mediation
      this.logger.log(`Premium seller ${property.sellerId} property interest - HIGH priority assigned`);
    }

    // Create interest expression
    const interestExpression = this.interestExpressionRepository.create({
      buyerId,
      propertyId: expressDto.propertyId,
      matchId: match?.id || null,
      message: expressDto.message,
      interestType: expressDto.interestType || InterestType.VIEWING,
      priority,
      connectionStatus: ConnectionStatus.PENDING,
      sellerContactRevealed: false, // CRITICAL: Contact hidden until CS approval
    });

    const saved = await this.interestExpressionRepository.save(interestExpression);

    this.logger.log(
      `Buyer ${buyerId} expressed interest in property ${expressDto.propertyId}. Status: PENDING CS review.`,
    );

    // Notify seller about interest (without revealing buyer contact - CRITICAL)
    this.notificationsService
      .notifyInterestExpression(property.sellerId, buyerId, expressDto.propertyId)
      .catch((error) => {
        this.logger.error(`Failed to send interest expression notification: ${error.message}`);
      });

    return saved;
  }

  /**
   * CS reviews buyer seriousness (Module 7 - Step 2)
   */
  async reviewBuyerSeriousness(
    csAgentId: string,
    reviewDto: CsReviewInterestDto,
  ): Promise<InterestExpression> {
    // Verify CS agent role
    const roles = await this.usersService.getUserRoles(csAgentId);
    if (!roles.includes('customer_service') && !roles.includes('admin')) {
      throw new ForbiddenException('Only customer service agents can review interest expressions');
    }

    // Find interest expression
    const interest = await this.interestExpressionRepository.findOne({
      where: { id: reviewDto.interestExpressionId, deletedAt: IsNull() },
      relations: ['property', 'buyer'],
    });

    if (!interest) {
      throw new NotFoundException('Interest expression not found');
    }

    // Verify action type
    if (reviewDto.actionType !== MediationActionType.BUYER_SERIOUSNESS_CHECK) {
      throw new BadRequestException('Invalid action type for buyer seriousness review');
    }

    // Create CS mediation action
    const action = this.mediationActionRepository.create({
      interestExpressionId: interest.id,
      csAgentId,
      actionType: MediationActionType.BUYER_SERIOUSNESS_CHECK,
      actionStatus: MediationActionStatus.COMPLETED,
      buyerSeriousnessScore: reviewDto.buyerSeriousnessScore || null,
      notes: reviewDto.notes,
      internalNotes: reviewDto.internalNotes,
      outcome: reviewDto.outcome,
      outcomeReason: reviewDto.outcomeReason,
      performedAt: new Date(),
    });

    await this.mediationActionRepository.save(action);

    // Update interest expression
    interest.csReviewed = true;
    interest.csAgentId = csAgentId;
    interest.buyerSeriousnessScore = reviewDto.buyerSeriousnessScore || null;
    interest.buyerSeriousnessNotes = reviewDto.buyerSeriousnessNotes || null;
    interest.csReviewedAt = new Date();

    // Update connection status based on outcome
    if (reviewDto.outcome === MediationOutcome.APPROVED) {
      // Move to seller willingness check
      interest.connectionStatus = ConnectionStatus.SELLER_CHECKING;
    } else if (reviewDto.outcome === MediationOutcome.REJECTED) {
      interest.connectionStatus = ConnectionStatus.REJECTED;
    } else {
      interest.connectionStatus = ConnectionStatus.CS_REVIEWING;
    }

    const updated = await this.interestExpressionRepository.save(interest);

    this.logger.log(
      `CS agent ${csAgentId} reviewed buyer seriousness for interest ${interest.id}. Outcome: ${reviewDto.outcome}`,
    );

    // Notify based on outcome
    if (reviewDto.outcome === MediationOutcome.APPROVED) {
      // Notify seller (if not already notified) - buyer interest approved
      this.notificationsService
        .notifyMediationUpdate(
          interest.property.sellerId,
          `Buyer interest in your property has been approved. CS will contact you soon.`,
          interest.id,
          'buyer_seriousness_approved',
        )
        .catch((error) => {
          this.logger.error(`Failed to send mediation update notification: ${error.message}`);
        });
    } else if (reviewDto.outcome === MediationOutcome.REJECTED) {
      // Notify buyer about rejection
      this.notificationsService
        .notifyMediationUpdate(
          interest.buyerId,
          `Your interest in the property could not be processed at this time. Our customer service team will contact you if there are updates.`,
          interest.id,
          'buyer_seriousness_rejected',
        )
        .catch((error) => {
          this.logger.error(`Failed to send rejection notification: ${error.message}`);
        });
    }

    return updated;
  }

  /**
   * CS checks seller willingness (Module 7 - Step 3)
   */
  async checkSellerWillingness(
    csAgentId: string,
    reviewDto: CsReviewInterestDto,
  ): Promise<InterestExpression> {
    // Verify CS agent role
    const roles = await this.usersService.getUserRoles(csAgentId);
    if (!roles.includes('customer_service') && !roles.includes('admin')) {
      throw new ForbiddenException('Only customer service agents can check seller willingness');
    }

    // Find interest expression
    const interest = await this.interestExpressionRepository.findOne({
      where: { id: reviewDto.interestExpressionId, deletedAt: IsNull() },
      relations: ['property', 'property.seller', 'buyer'],
    });

    if (!interest) {
      throw new NotFoundException('Interest expression not found');
    }

    // Verify it's in seller_checking status
    if (interest.connectionStatus !== ConnectionStatus.SELLER_CHECKING) {
      throw new BadRequestException(
        `Interest expression must be in ${ConnectionStatus.SELLER_CHECKING} status to check seller willingness`,
      );
    }

    // Verify action type
    if (reviewDto.actionType !== MediationActionType.SELLER_WILLINGNESS_CHECK) {
      throw new BadRequestException('Invalid action type for seller willingness check');
    }

    // Create CS mediation action
    const action = this.mediationActionRepository.create({
      interestExpressionId: interest.id,
      csAgentId,
      actionType: MediationActionType.SELLER_WILLINGNESS_CHECK,
      actionStatus: MediationActionStatus.COMPLETED,
      sellerWillingnessScore: reviewDto.sellerWillingnessScore || null,
      notes: reviewDto.notes,
      internalNotes: reviewDto.internalNotes,
      outcome: reviewDto.outcome,
      outcomeReason: reviewDto.outcomeReason,
      performedAt: new Date(),
    });

    await this.mediationActionRepository.save(action);

    // Update interest expression
    interest.sellerWillingnessChecked = true;
    interest.sellerWillingnessScore = reviewDto.sellerWillingnessScore || null;
    interest.sellerWillingnessNotes = reviewDto.sellerWillingnessNotes || null;
    interest.sellerWillingnessCheckedAt = new Date();

    // Update connection status based on outcome
    if (reviewDto.outcome === MediationOutcome.APPROVED) {
      // Both buyer and seller are willing - ready for connection approval
      interest.connectionStatus = ConnectionStatus.APPROVED;
    } else if (reviewDto.outcome === MediationOutcome.REJECTED) {
      interest.connectionStatus = ConnectionStatus.REJECTED;
    }

    const updated = await this.interestExpressionRepository.save(interest);

    this.logger.log(
      `CS agent ${csAgentId} checked seller willingness for interest ${interest.id}. Outcome: ${reviewDto.outcome}`,
    );

    // Notify buyer and seller based on outcome
    if (reviewDto.outcome === MediationOutcome.APPROVED) {
      // Both parties willing - notify both
      this.notificationsService
        .notifyMediationUpdate(
          interest.buyerId,
          `Great news! The seller is interested. Our customer service team will connect you both soon.`,
          interest.id,
          'seller_willingness_approved',
        )
        .catch((error) => {
          this.logger.error(`Failed to send buyer notification: ${error.message}`);
        });
      this.notificationsService
        .notifyMediationUpdate(
          interest.property.sellerId,
          `Buyer is serious and ready. Our customer service team will connect you both soon.`,
          interest.id,
          'seller_willingness_approved',
        )
        .catch((error) => {
          this.logger.error(`Failed to send seller notification: ${error.message}`);
        });
    } else if (reviewDto.outcome === MediationOutcome.REJECTED) {
      // Notify buyer about rejection
      this.notificationsService
        .notifyMediationUpdate(
          interest.buyerId,
          `The seller is not available at this time. We'll notify you if they become interested.`,
          interest.id,
          'seller_willingness_rejected',
        )
        .catch((error) => {
          this.logger.error(`Failed to send rejection notification: ${error.message}`);
        });
    }

    return updated;
  }

  /**
   * CS approves connection (Module 7 - Step 4)
   * CRITICAL: This is when contact is revealed and chat/call is enabled
   */
  async approveConnection(csAgentId: string, approveDto: ApproveConnectionDto): Promise<InterestExpression> {
    // Verify CS agent role
    const roles = await this.usersService.getUserRoles(csAgentId);
    if (!roles.includes('customer_service') && !roles.includes('admin')) {
      throw new ForbiddenException('Only customer service agents can approve connections');
    }

    // Find interest expression
    const interest = await this.interestExpressionRepository.findOne({
      where: { id: approveDto.interestExpressionId, deletedAt: IsNull() },
      relations: ['property', 'property.seller', 'buyer'],
    });

    if (!interest) {
      throw new NotFoundException('Interest expression not found');
    }

    // CRITICAL: Must be approved status (buyer and seller both checked and willing)
    if (interest.connectionStatus !== ConnectionStatus.APPROVED) {
      throw new BadRequestException(
        `Interest expression must be in ${ConnectionStatus.APPROVED} status (both buyer and seller checked) before connection can be approved`,
      );
    }

    // Create CS mediation action
    const action = this.mediationActionRepository.create({
      interestExpressionId: interest.id,
      csAgentId,
      actionType: MediationActionType.CONNECTION_APPROVAL,
      actionStatus: MediationActionStatus.COMPLETED,
      notes: approveDto.notes,
      internalNotes: approveDto.internalNotes,
      outcome: MediationOutcome.APPROVED,
      outcomeReason: 'Connection approved by CS agent',
      performedAt: new Date(),
    });

    await this.mediationActionRepository.save(action);

    // CRITICAL: Reveal contacts (only after CS approval)
    interest.connectionStatus = ConnectionStatus.CONNECTED;
    interest.connectionApprovedAt = new Date();
    interest.connectionApprovedBy = csAgentId;
    interest.sellerContactRevealed = approveDto.revealSellerContact !== false; // Default true
    interest.sellerContactRevealedAt = approveDto.revealSellerContact !== false ? new Date() : null;

    // Create chat session (enabled ONLY after CS approval)
    const chatSession = this.chatSessionRepository.create({
      interestExpressionId: interest.id,
      buyerId: interest.buyerId,
      sellerId: interest.property.sellerId,
      csAgentId, // CRITICAL: CS is always part of the session
      status: ChatSessionStatus.ACTIVE,
      buyerCanSeeSellerContact: approveDto.revealSellerContact !== false,
      sellerCanSeeBuyerContact: approveDto.revealBuyerContact !== false,
      contactRevealedAt: new Date(),
    });

    const savedChatSession = await this.chatSessionRepository.save(chatSession);

    // Link chat session to interest expression
    interest.chatSessionId = savedChatSession.id;

    const updated = await this.interestExpressionRepository.save(interest);

    this.logger.log(
      `CS agent ${csAgentId} approved connection for interest ${interest.id}. Chat session created: ${savedChatSession.id}. Contact revealed: ${interest.sellerContactRevealed}`,
    );

    // Notify buyer and seller that connection is approved and chat is enabled
    this.notificationsService
      .notifyMediationUpdate(
        interest.buyerId,
        `Connection approved! Chat is now enabled. You can communicate with the seller through our platform. ${approveDto.revealSellerContact ? 'Seller contact details are now available.' : ''}`,
        interest.id,
        'connection_approved',
      )
      .catch((error) => {
        this.logger.error(`Failed to send buyer notification: ${error.message}`);
      });
    this.notificationsService
      .notifyMediationUpdate(
        interest.property.sellerId,
        `Connection approved! Chat is now enabled. You can communicate with the buyer through our platform. ${approveDto.revealBuyerContact ? 'Buyer contact details are now available.' : ''}`,
        interest.id,
        'connection_approved',
      )
      .catch((error) => {
        this.logger.error(`Failed to send seller notification: ${error.message}`);
      });

    return updated;
  }

  /**
   * CS rejects connection
   */
  async rejectConnection(csAgentId: string, interestExpressionId: string, reason?: string): Promise<InterestExpression> {
    // Verify CS agent role
    const roles = await this.usersService.getUserRoles(csAgentId);
    if (!roles.includes('customer_service') && !roles.includes('admin')) {
      throw new ForbiddenException('Only customer service agents can reject connections');
    }

    const interest = await this.interestExpressionRepository.findOne({
      where: { id: interestExpressionId, deletedAt: IsNull() },
    });

    if (!interest) {
      throw new NotFoundException('Interest expression not found');
    }

    // Create CS mediation action
    const action = this.mediationActionRepository.create({
      interestExpressionId: interest.id,
      csAgentId,
      actionType: MediationActionType.CONNECTION_REJECTION,
      actionStatus: MediationActionStatus.COMPLETED,
      outcome: MediationOutcome.REJECTED,
      outcomeReason: reason || 'Connection rejected by CS agent',
      performedAt: new Date(),
    });

    await this.mediationActionRepository.save(action);

    // Update interest expression
    interest.connectionStatus = ConnectionStatus.REJECTED;
    // CRITICAL: Contact remains hidden (sellerContactRevealed stays false)

    const updated = await this.interestExpressionRepository.save(interest);

    this.logger.log(`CS agent ${csAgentId} rejected connection for interest ${interest.id}`);

    // Notify buyer and seller about rejection
    this.notificationsService
      .notifyMediationUpdate(
        interest.buyerId,
        `Connection request has been rejected. ${reason ? `Reason: ${reason}` : 'You can contact customer service for more information.'}`,
        interest.id,
        'connection_rejected',
      )
      .catch((error) => {
        this.logger.error(`Failed to send rejection notification: ${error.message}`);
      });

    return updated;
  }

  /**
   * Get pending interest expressions for CS dashboard
   */
  async getPendingInterestExpressions(
    csAgentId: string,
    filterDto: MediationFilterDto,
  ): Promise<{
    interests: InterestExpression[];
    total: number;
    page: number;
    limit: number;
  }> {
    // Verify CS agent role
    const roles = await this.usersService.getUserRoles(csAgentId);
    if (!roles.includes('customer_service') && !roles.includes('admin')) {
      throw new ForbiddenException('Only customer service agents can access this endpoint');
    }

    const page = filterDto.page || 1;
    const limit = filterDto.limit || 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.interestExpressionRepository
      .createQueryBuilder('interest')
      .leftJoinAndSelect('interest.buyer', 'buyer')
      .leftJoinAndSelect('interest.property', 'property')
      .leftJoinAndSelect('property.seller', 'seller')
      .leftJoinAndSelect('interest.mediationActions', 'actions')
      .leftJoinAndSelect('actions.csAgent', 'csAgent')
      .where('interest.deletedAt IS NULL');

    // Filter by connection status
    if (filterDto.connectionStatus) {
      queryBuilder.andWhere('interest.connectionStatus = :status', { status: filterDto.connectionStatus });
    } else if (!filterDto.includeAll) {
      // Default: show pending and in-review statuses
      queryBuilder.andWhere('interest.connectionStatus IN (:...statuses)', {
        statuses: [ConnectionStatus.PENDING, ConnectionStatus.CS_REVIEWING, ConnectionStatus.SELLER_CHECKING],
      });
    }

    if (filterDto.propertyId) {
      queryBuilder.andWhere('interest.propertyId = :propertyId', { propertyId: filterDto.propertyId });
    }

    if (filterDto.buyerId) {
      queryBuilder.andWhere('interest.buyerId = :buyerId', { buyerId: filterDto.buyerId });
    }

    if (filterDto.sellerId) {
      queryBuilder.andWhere('property.sellerId = :sellerId', { sellerId: filterDto.sellerId });
    }

    const [interests, total] = await queryBuilder
      .orderBy('interest.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    // CRITICAL: Apply contact visibility rules
    // Only CS can see both contacts - buyers and sellers cannot see each other's contact until CS approval
    interests.forEach((interest) => {
      if (interest.property?.seller && !interest.sellerContactRevealed) {
        // Hide seller contact - not revealed until CS approval
        interest.property.seller.primaryPhone = undefined;
        interest.property.seller.primaryEmail = undefined;
      }
      if (interest.buyer && !interest.sellerContactRevealed) {
        // Hide buyer contact - not revealed until CS approval
        interest.buyer.primaryPhone = undefined;
        interest.buyer.primaryEmail = undefined;
      }
    });

    return {
      interests,
      total,
      page,
      limit,
    };
  }

  /**
   * Get interest expressions for a buyer (their own interests)
   */
  async getMyInterests(
    buyerId: string,
    filterDto: MediationFilterDto,
  ): Promise<{
    interests: InterestExpression[];
    total: number;
    page: number;
    limit: number;
  }> {
    const where: FindOptionsWhere<InterestExpression> = {
      buyerId,
      deletedAt: IsNull(),
    };

    if (filterDto.connectionStatus) {
      where.connectionStatus = filterDto.connectionStatus;
    }

    if (filterDto.propertyId) {
      where.propertyId = filterDto.propertyId;
    }

    const page = filterDto.page || 1;
    const limit = filterDto.limit || 20;
    const skip = (page - 1) * limit;

    const [interests, total] = await this.interestExpressionRepository.findAndCount({
      where,
      relations: ['property', 'property.seller', 'property.images', 'mediationActions', 'chatSessions'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    // CRITICAL: Remove seller contact unless connection is approved and contact revealed
    interests.forEach((interest) => {
      if (interest.property?.seller && !interest.sellerContactRevealed) {
        // Hide seller contact - buyer cannot see until CS approval
        interest.property.seller.primaryPhone = undefined;
        interest.property.seller.primaryEmail = undefined;
      }
    });

    return {
      interests,
      total,
      page,
      limit,
    };
  }

  /**
   * Get interest expressions for a seller (interests in their properties)
   */
  async getInterestsForMyProperties(
    sellerId: string,
    filterDto: MediationFilterDto,
  ): Promise<{
    interests: InterestExpression[];
    total: number;
    page: number;
    limit: number;
  }> {
    const queryBuilder = this.interestExpressionRepository
      .createQueryBuilder('interest')
      .leftJoinAndSelect('interest.buyer', 'buyer')
      .leftJoinAndSelect('interest.property', 'property')
      .leftJoinAndSelect('property.images', 'images')
      .leftJoinAndSelect('interest.mediationActions', 'actions')
      .where('property.sellerId = :sellerId', { sellerId })
      .andWhere('interest.deletedAt IS NULL');

    if (filterDto.connectionStatus) {
      queryBuilder.andWhere('interest.connectionStatus = :status', { status: filterDto.connectionStatus });
    }

    if (filterDto.propertyId) {
      queryBuilder.andWhere('interest.propertyId = :propertyId', { propertyId: filterDto.propertyId });
    }

    const page = filterDto.page || 1;
    const limit = filterDto.limit || 20;
    const skip = (page - 1) * limit;

    const [interests, total] = await queryBuilder
      .orderBy('interest.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    // CRITICAL: Remove buyer contact unless connection is approved and contact revealed
    interests.forEach((interest) => {
      if (interest.buyer && !interest.sellerContactRevealed) {
        // Hide buyer contact - seller cannot see until CS approval
        interest.buyer.primaryPhone = undefined;
        interest.buyer.primaryEmail = undefined;
      }
    });

    return {
      interests,
      total,
      page,
      limit,
    };
  }

  /**
   * Get single interest expression (with contact visibility rules)
   */
  async getInterestExpression(
    interestId: string,
    userId: string,
  ): Promise<InterestExpression> {
    const roles = await this.usersService.getUserRoles(userId);
    const isCsOrAdmin = roles.includes('customer_service') || roles.includes('admin');

    const interest = await this.interestExpressionRepository.findOne({
      where: { id: interestId, deletedAt: IsNull() },
      relations: ['buyer', 'property', 'property.seller', 'property.images', 'mediationActions', 'chatSessions'],
    });

    if (!interest) {
      throw new NotFoundException('Interest expression not found');
    }

    // CRITICAL: Check access permissions
    if (!isCsOrAdmin && interest.buyerId !== userId && interest.property.sellerId !== userId) {
      throw new ForbiddenException('You do not have access to this interest expression');
    }

    // CRITICAL: Apply contact visibility rules
    if (!isCsOrAdmin) {
      if (interest.buyerId === userId) {
        // Buyer viewing - hide seller contact unless revealed
        if (interest.property?.seller && !interest.sellerContactRevealed) {
          interest.property.seller.primaryPhone = undefined;
          interest.property.seller.primaryEmail = undefined;
        }
      } else if (interest.property.sellerId === userId) {
        // Seller viewing - hide buyer contact unless connection approved and contact revealed
        if (interest.buyer && !interest.sellerContactRevealed) {
          interest.buyer.primaryPhone = undefined;
          interest.buyer.primaryEmail = undefined;
        }
      }
    }
    // CS/Admin can see all contacts (no filtering)

    return interest;
  }

  /**
   * Get chat session (only if connection is approved)
   */
  async getChatSession(sessionId: string, userId: string): Promise<ChatSession> {
    const roles = await this.usersService.getUserRoles(userId);
    const isCsOrAdmin = roles.includes('customer_service') || roles.includes('admin');

    const session = await this.chatSessionRepository.findOne({
      where: { id: sessionId },
      relations: ['buyer', 'seller', 'csAgent', 'messages', 'messages.sender'],
      order: { messages: { createdAt: 'ASC' } },
    });

    if (!session) {
      throw new NotFoundException('Chat session not found');
    }

    // CRITICAL: Only participants (buyer, seller, CS) can access
    if (!isCsOrAdmin && session.buyerId !== userId && session.sellerId !== userId) {
      throw new ForbiddenException('You do not have access to this chat session');
    }

    // Apply contact visibility rules
    if (!isCsOrAdmin) {
      if (session.buyerId === userId) {
        // Buyer - hide seller contact unless revealed
        if (!session.buyerCanSeeSellerContact && session.seller) {
          delete session.seller.primaryPhone;
          delete session.seller.primaryEmail;
        }
      } else if (session.sellerId === userId) {
        // Seller - hide buyer contact unless revealed
        if (!session.sellerCanSeeBuyerContact && session.buyer) {
          delete session.buyer.primaryPhone;
          delete session.buyer.primaryEmail;
        }
      }
    }

    return session;
  }

  /**
   * Send message in chat session (only after connection approved)
   */
  async sendMessage(
    sessionId: string,
    senderId: string,
    content: string,
    messageType: MessageType = MessageType.TEXT,
  ): Promise<ChatMessage> {
    const session = await this.chatSessionRepository.findOne({
      where: { id: sessionId, status: ChatSessionStatus.ACTIVE },
    });

    if (!session) {
      throw new NotFoundException('Chat session not found or not active');
    }

    // CRITICAL: Only participants can send messages
    if (session.buyerId !== senderId && session.sellerId !== senderId && session.csAgentId !== senderId) {
      throw new ForbiddenException('You are not a participant in this chat session');
    }

    // Determine sender role
    let senderRole: 'buyer' | 'seller' | 'customer_service';
    if (session.buyerId === senderId) {
      senderRole = 'buyer';
    } else if (session.sellerId === senderId) {
      senderRole = 'seller';
    } else {
      senderRole = 'customer_service';
    }

    // Create message
    const message = this.chatMessageRepository.create({
      chatSessionId: session.id,
      senderId,
      senderRole,
      messageType,
      content,
      isRead: false,
    });

    const saved = await this.chatMessageRepository.save(message);

    // Update session
    session.lastMessageAt = new Date();
    session.messageCount += 1;
    await this.chatSessionRepository.save(session);

    // TODO: Send real-time notification via WebSocket (future enhancement - Module 9)
    // Note: Push notifications are sent via Firebase FCM for real-time delivery
    // TODO: AI moderation check (flag inappropriate messages - future enhancement)

    return saved;
  }
}
