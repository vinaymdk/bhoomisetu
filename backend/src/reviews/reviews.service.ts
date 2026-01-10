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
import { Repository, FindOptionsWhere, Like, IsNull, Between, LessThanOrEqual, MoreThanOrEqual, In, Not } from 'typeorm';
import { Review, ReviewType, ReviewContext, ReviewStatus, SentimentLabel } from './entities/review.entity';
import { ReviewHelpfulVote } from './entities/review-helpful-vote.entity';
import { ReviewReport, ReportReason, ReportStatus } from './entities/review-report.entity';
import { ReviewReply, ReplyStatus } from './entities/review-reply.entity';
import { InterestExpression, ConnectionStatus } from '../mediation/entities/interest-expression.entity';
import { ChatSession, ChatSessionStatus } from '../mediation/entities/chat-session.entity';
import { Property, PropertyStatus } from '../properties/entities/property.entity';
import { User } from '../users/entities/user.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewFilterDto } from './dto/review-filter.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { ReportReviewDto } from './dto/report-review.dto';
import { CreateReplyDto } from './dto/create-reply.dto';
import { AiService } from '../ai/ai.service';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(ReviewHelpfulVote)
    private readonly helpfulVoteRepository: Repository<ReviewHelpfulVote>,
    @InjectRepository(ReviewReport)
    private readonly reviewReportRepository: Repository<ReviewReport>,
    @InjectRepository(ReviewReply)
    private readonly reviewReplyRepository: Repository<ReviewReply>,
    @InjectRepository(InterestExpression)
    private readonly interestExpressionRepository: Repository<InterestExpression>,
    @InjectRepository(ChatSession)
    private readonly chatSessionRepository: Repository<ChatSession>,
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly aiService: AiService,
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => NotificationsService))
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Create a new review (after viewing/deal)
   * CRITICAL: Reviews can only be created after verified viewing/deal (via interest expression or chat session)
   */
  async createReview(reviewerId: string, createDto: CreateReviewDto): Promise<ReviewResponseDto> {
    // Verify reviewee exists
    const reviewee = await this.userRepository.findOne({ where: { id: createDto.revieweeId } });
    if (!reviewee) {
      throw new NotFoundException('Reviewee (seller/agent) not found');
    }

    // CRITICAL: Reviewer cannot review themselves
    if (reviewerId === createDto.revieweeId) {
      throw new ForbiddenException('You cannot review yourself');
    }

    // Verify property if provided
    let property: Property | null = null;
    if (createDto.propertyId) {
      property = await this.propertyRepository.findOne({
        where: { id: createDto.propertyId },
        relations: ['seller'],
      });
      if (!property) {
        throw new NotFoundException('Property not found');
      }
      // Verify property belongs to reviewee
      if (property.sellerId !== createDto.revieweeId) {
        throw new BadRequestException('Property does not belong to the specified reviewee');
      }
      // CRITICAL: Property must be LIVE for review
      if (property.status !== PropertyStatus.LIVE) {
        throw new BadRequestException('Cannot review a property that is not live');
      }
    }

    // Verify interest expression or chat session for verified purchase/viewing
    let isVerifiedPurchase = false;
    if (createDto.interestExpressionId) {
      const interestExpression = await this.interestExpressionRepository.findOne({
        where: {
          id: createDto.interestExpressionId,
          buyerId: reviewerId,
          propertyId: createDto.propertyId || undefined,
          connectionStatus: In([ConnectionStatus.CONNECTED, ConnectionStatus.APPROVED]),
        },
      });
      if (!interestExpression) {
        throw new NotFoundException('Interest expression not found or not connected');
      }
      isVerifiedPurchase = true;
    } else if (createDto.chatSessionId) {
      const chatSession = await this.chatSessionRepository.findOne({
        where: {
          id: createDto.chatSessionId,
          buyerId: reviewerId,
          status: In([ChatSessionStatus.ACTIVE, ChatSessionStatus.ENDED]),
        },
      });
      if (!chatSession) {
        throw new NotFoundException('Chat session not found or not active');
      }
      isVerifiedPurchase = true;
    }

    // Check if review already exists (one review per reviewer-reviewee-property combination)
    if (createDto.propertyId) {
      const existingReview = await this.reviewRepository.findOne({
        where: {
          reviewerId,
          revieweeId: createDto.revieweeId,
          propertyId: createDto.propertyId,
          deletedAt: IsNull(),
        },
      });
      if (existingReview) {
        throw new BadRequestException('You have already reviewed this property');
      }
    }

    // Create review entity
    const review = this.reviewRepository.create({
      reviewerId,
      revieweeId: createDto.revieweeId,
      propertyId: createDto.propertyId || null,
      interestExpressionId: createDto.interestExpressionId || null,
      chatSessionId: createDto.chatSessionId || null,
      reviewType: createDto.reviewType,
      reviewContext: createDto.reviewContext || null,
      overallRating: createDto.overallRating,
      propertyRating: createDto.propertyRating || null,
      sellerRating: createDto.sellerRating || null,
      responsivenessRating: createDto.responsivenessRating || null,
      communicationRating: createDto.communicationRating || null,
      professionalismRating: createDto.professionalismRating || null,
      title: createDto.title || null,
      comment: createDto.comment,
      pros: createDto.pros || null,
      cons: createDto.cons || null,
      isVerifiedPurchase,
      isAnonymous: createDto.isAnonymous || false,
      status: ReviewStatus.PENDING, // Pending AI analysis and moderation
    });

    // Perform AI sentiment analysis
    try {
      const sentimentAnalysis = await this.aiService.analyzeSentiment({
        reviewText: createDto.comment,
        title: createDto.title,
        pros: createDto.pros,
        cons: createDto.cons,
        rating: createDto.overallRating,
        context: createDto.reviewContext,
      });

      review.sentimentScore = sentimentAnalysis.sentimentScore;
      review.sentimentLabel = sentimentAnalysis.sentimentLabel;
      review.aiAnalysisPerformed = true;
      review.aiAnalysisResult = {
        sentiment: sentimentAnalysis,
        keyPhrases: sentimentAnalysis.keyPhrases,
        topics: sentimentAnalysis.topics,
        analysis: sentimentAnalysis.analysis,
      };
      review.aiConfidence = sentimentAnalysis.confidence;

      this.logger.log(`Sentiment analysis completed for review ${review.id}: ${sentimentAnalysis.sentimentLabel}`);
    } catch (error: any) {
      this.logger.error(`Failed to perform sentiment analysis: ${error.message}`);
      // Continue without sentiment analysis (graceful degradation)
    }

    // Perform AI fake review detection
    try {
      // Get reviewer's previous reviews for context
      const previousReviews = await this.reviewRepository.find({
        where: { reviewerId, deletedAt: IsNull() },
        order: { createdAt: 'DESC' },
        take: 10,
      });

      const reviewer = await this.userRepository.findOne({ where: { id: reviewerId } });
      const accountAge = reviewer ? Math.floor((Date.now() - new Date(reviewer.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0;

      const fakeDetection = await this.aiService.detectFakeReview({
        reviewText: createDto.comment,
        title: createDto.title,
        rating: createDto.overallRating,
        reviewerId,
        revieweeId: createDto.revieweeId,
        propertyId: createDto.propertyId,
        interestExpressionId: createDto.interestExpressionId,
        chatSessionId: createDto.chatSessionId,
        context: {
          previousReviews: previousReviews.map((r) => ({
            reviewId: r.id,
            reviewText: r.comment,
            rating: r.overallRating,
            createdAt: r.createdAt.toISOString(),
          })),
          reviewCount: previousReviews.length,
          accountAge,
          verifiedPurchase: isVerifiedPurchase,
        },
      });

      review.fakeReviewScore = fakeDetection.fakeReviewScore;
      review.fakeReviewDetected = fakeDetection.isFake;
      review.fakeReviewReasons = fakeDetection.reasons;
      review.aiConfidence = fakeDetection.confidence;
      if (review.aiAnalysisResult) {
        review.aiAnalysisResult.fakeDetection = fakeDetection;
      }

      // Auto-flag for moderation if fake detected
      if (fakeDetection.isFake) {
        review.status = ReviewStatus.FLAGGED;
        this.logger.warn(`Fake review detected for review ${review.id}. Score: ${fakeDetection.fakeReviewScore}. Reasons: ${fakeDetection.reasons.join(', ')}`);
      } else {
        // Auto-approve if not fake and verified purchase
        if (isVerifiedPurchase && fakeDetection.fakeReviewScore < 0.3) {
          review.status = ReviewStatus.APPROVED;
        }
      }

      this.logger.log(`Fake review detection completed for review ${review.id}: ${fakeDetection.isFake ? 'FAKE' : 'GENUINE'}`);
    } catch (error: any) {
      this.logger.error(`Failed to perform fake review detection: ${error.message}`);
      // Continue without fake detection (graceful degradation)
      // Auto-approve verified purchases even if AI unavailable
      if (isVerifiedPurchase) {
        review.status = ReviewStatus.APPROVED;
      }
    }

    const savedReview = await this.reviewRepository.save(review);

    // Load relations for response
    const fullReview = await this.reviewRepository.findOne({
      where: { id: savedReview.id },
      relations: ['reviewer', 'reviewee', 'property'],
    });
    if (!fullReview) {
      throw new NotFoundException('Review not found after creation');
    }

    // Notify reviewee about new review
    this.notificationsService
      .sendNotification(
        createDto.revieweeId,
        'PROPERTY_MATCH' as any, // Using existing notification type as fallback
        'New Review Received',
        `You have received a new review with ${createDto.overallRating} stars.`,
        {
          data: { reviewId: savedReview.id, propertyId: createDto.propertyId },
          priority: 'normal' as any,
        },
      )
      .catch((error) => {
        this.logger.error(`Failed to send review notification: ${error.message}`);
      });

    // Notify CS agents if review is flagged
    if (savedReview.status === ReviewStatus.FLAGGED) {
      // TODO: Notify CS agents about flagged review
      this.logger.log(`Review ${savedReview.id} flagged for CS review`);
    }

    return this.mapToResponseDto(fullReview, reviewerId);
  }

  /**
   * Update a review (only by reviewer, before moderation)
   */
  async updateReview(reviewerId: string, reviewId: string, updateDto: UpdateReviewDto): Promise<ReviewResponseDto> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId, reviewerId, deletedAt: IsNull() },
    });

    if (!review) {
      throw new NotFoundException('Review not found or you do not have permission to update it');
    }

    // Cannot update approved/rejected reviews
    if (review.status !== ReviewStatus.PENDING && review.status !== ReviewStatus.FLAGGED) {
      throw new BadRequestException('Cannot update a review that has already been moderated');
    }

    // Update fields
    if (updateDto.comment !== undefined) review.comment = updateDto.comment;
    if (updateDto.pros !== undefined) review.pros = updateDto.pros;
    if (updateDto.cons !== undefined) review.cons = updateDto.cons;
    if (updateDto.title !== undefined) review.title = updateDto.title;
    if (updateDto.overallRating !== undefined) review.overallRating = updateDto.overallRating;
    if (updateDto.propertyRating !== undefined) review.propertyRating = updateDto.propertyRating;
    if (updateDto.sellerRating !== undefined) review.sellerRating = updateDto.sellerRating;
    if (updateDto.responsivenessRating !== undefined) review.responsivenessRating = updateDto.responsivenessRating;
    if (updateDto.communicationRating !== undefined) review.communicationRating = updateDto.communicationRating;
    if (updateDto.professionalismRating !== undefined) review.professionalismRating = updateDto.professionalismRating;

    review.isEdited = true;
    review.editedAt = new Date();
    review.status = ReviewStatus.PENDING; // Reset to pending for re-analysis

    // Re-run AI analysis if comment changed
    if (updateDto.comment) {
      try {
        const sentimentAnalysis = await this.aiService.analyzeSentiment({
          reviewText: review.comment,
          title: review.title || undefined,
          pros: review.pros || undefined,
          cons: review.cons || undefined,
          rating: review.overallRating,
          context: review.reviewContext || undefined,
        });

        review.sentimentScore = sentimentAnalysis.sentimentScore;
        review.sentimentLabel = sentimentAnalysis.sentimentLabel;
        review.aiAnalysisResult = {
          sentiment: sentimentAnalysis,
          keyPhrases: sentimentAnalysis.keyPhrases,
          topics: sentimentAnalysis.topics,
          analysis: sentimentAnalysis.analysis,
        };
        review.aiConfidence = sentimentAnalysis.confidence;

        // Re-run fake detection
        const allReviews = await this.reviewRepository.find({
          where: { reviewerId, deletedAt: IsNull() },
          order: { createdAt: 'DESC' },
          take: 11, // Get one extra to filter out current review
        });
        const previousReviews = allReviews.filter((r) => r.id !== reviewId).slice(0, 10);

        const reviewer = await this.userRepository.findOne({ where: { id: reviewerId } });
        const accountAge = reviewer ? Math.floor((Date.now() - new Date(reviewer.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0;

        const fakeDetection = await this.aiService.detectFakeReview({
          reviewText: review.comment,
          title: review.title || undefined,
          rating: review.overallRating,
          reviewerId,
          revieweeId: review.revieweeId,
          propertyId: review.propertyId || undefined,
          interestExpressionId: review.interestExpressionId || undefined,
          chatSessionId: review.chatSessionId || undefined,
          context: {
            previousReviews: previousReviews.map((r) => ({
              reviewId: r.id,
              reviewText: r.comment,
              rating: r.overallRating,
              createdAt: r.createdAt.toISOString(),
            })),
            reviewCount: previousReviews.length,
            accountAge,
            verifiedPurchase: review.isVerifiedPurchase,
          },
        });

        review.fakeReviewScore = fakeDetection.fakeReviewScore;
        review.fakeReviewDetected = fakeDetection.isFake;
        review.fakeReviewReasons = fakeDetection.reasons;
        if (review.aiAnalysisResult) {
          review.aiAnalysisResult.fakeDetection = fakeDetection;
        }

        if (fakeDetection.isFake) {
          review.status = ReviewStatus.FLAGGED;
        } else if (review.isVerifiedPurchase && fakeDetection.fakeReviewScore < 0.3) {
          review.status = ReviewStatus.APPROVED;
        }
      } catch (error: any) {
        this.logger.error(`Failed to re-analyze updated review: ${error.message}`);
      }
    }

    const updatedReview = await this.reviewRepository.save(review);
    return this.mapToResponseDto(updatedReview, reviewerId);
  }

  /**
   * Get reviews with filters
   */
  async findAll(filterDto: ReviewFilterDto, userId?: string): Promise<{ reviews: ReviewResponseDto[]; total: number; page: number; limit: number }> {
    const page = filterDto.page || 1;
    const limit = filterDto.limit || 20;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Review> = {
      deletedAt: IsNull(),
    };

    if (filterDto.reviewerId) where.reviewerId = filterDto.reviewerId;
    if (filterDto.revieweeId) where.revieweeId = filterDto.revieweeId;
    if (filterDto.propertyId) where.propertyId = filterDto.propertyId;
    if (filterDto.reviewType) where.reviewType = filterDto.reviewType;
    if (filterDto.reviewContext) where.reviewContext = filterDto.reviewContext;
    if (filterDto.status) where.status = filterDto.status;
    if (filterDto.isVerifiedPurchase !== undefined) where.isVerifiedPurchase = filterDto.isVerifiedPurchase;
    if (filterDto.fakeReviewDetected !== undefined) where.fakeReviewDetected = filterDto.fakeReviewDetected;

    const queryBuilder = this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.reviewer', 'reviewer')
      .leftJoinAndSelect('review.reviewee', 'reviewee')
      .leftJoinAndSelect('review.property', 'property')
      .where(where);

    // Rating filters
    if (filterDto.minRating) {
      queryBuilder.andWhere('review.overallRating >= :minRating', { minRating: filterDto.minRating });
    }
    if (filterDto.maxRating) {
      queryBuilder.andWhere('review.overallRating <= :maxRating', { maxRating: filterDto.maxRating });
    }

    // Search in comment, title, pros, cons
    if (filterDto.search) {
      queryBuilder.andWhere(
        '(review.comment ILIKE :search OR review.title ILIKE :search OR review.pros ILIKE :search OR review.cons ILIKE :search)',
        { search: `%${filterDto.search}%` },
      );
    }

    // Only show approved reviews to non-owners (except for pending reviews by current user)
    if (userId) {
      queryBuilder.andWhere(
        '(review.status = :approvedStatus OR (review.status = :pendingStatus AND review.reviewerId = :userId))',
        { approvedStatus: ReviewStatus.APPROVED, pendingStatus: ReviewStatus.PENDING, userId },
      );
    } else {
      queryBuilder.andWhere('review.status = :status', { status: ReviewStatus.APPROVED });
    }

    // Sorting
    const sortBy = filterDto.sortBy || 'createdAt';
    const sortOrder = filterDto.sortOrder || 'DESC';
    queryBuilder.orderBy(`review.${sortBy}`, sortOrder);

    // Pagination
    queryBuilder.skip(skip).take(limit);

    const [reviews, total] = await queryBuilder.getManyAndCount();

    // Map to response DTOs and check if user has voted
    const reviewDtos = await Promise.all(reviews.map((review) => this.mapToResponseDto(review, userId)));

    return {
      reviews: reviewDtos,
      total,
      page,
      limit,
    };
  }

  /**
   * Get a single review by ID
   */
  async findOne(reviewId: string, userId?: string): Promise<ReviewResponseDto> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId, deletedAt: IsNull() },
      relations: ['reviewer', 'reviewee', 'property', 'replies'],
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Only show approved reviews to non-owners (except for pending reviews by current user)
    if (review.status !== ReviewStatus.APPROVED && review.reviewerId !== userId) {
      throw new NotFoundException('Review not found');
    }

    return this.mapToResponseDto(review, userId);
  }

  /**
   * Vote on review helpfulness
   */
  async voteHelpful(userId: string, reviewId: string, isHelpful: boolean): Promise<void> {
    const review = await this.reviewRepository.findOne({ where: { id: reviewId } });
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Cannot vote on own review
    if (review.reviewerId === userId) {
      throw new ForbiddenException('You cannot vote on your own review');
    }

    // Check if user already voted
    const existingVote = await this.helpfulVoteRepository.findOne({
      where: { reviewId, userId },
    });

    if (existingVote) {
      // Update existing vote
      if (existingVote.isHelpful !== isHelpful) {
        // Reverse the vote
        existingVote.isHelpful = isHelpful;
        await this.helpfulVoteRepository.save(existingVote);

        // Update counts
        if (isHelpful) {
          review.helpfulCount += 1;
          review.notHelpfulCount -= 1;
        } else {
          review.helpfulCount -= 1;
          review.notHelpfulCount += 1;
        }
      } else {
        // Same vote, remove it
        await this.helpfulVoteRepository.remove(existingVote);
        if (isHelpful) {
          review.helpfulCount -= 1;
        } else {
          review.notHelpfulCount -= 1;
        }
      }
    } else {
      // Create new vote
      const vote = this.helpfulVoteRepository.create({
        reviewId,
        userId,
        isHelpful,
      });
      await this.helpfulVoteRepository.save(vote);

      // Update counts
      if (isHelpful) {
        review.helpfulCount += 1;
      } else {
        review.notHelpfulCount += 1;
      }
    }

    await this.reviewRepository.save(review);
  }

  /**
   * Report a review
   */
  async reportReview(userId: string, reviewId: string, reportDto: ReportReviewDto): Promise<void> {
    const review = await this.reviewRepository.findOne({ where: { id: reviewId } });
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Cannot report own review
    if (review.reviewerId === userId) {
      throw new ForbiddenException('You cannot report your own review');
    }

    // Check if user already reported this review
    const existingReport = await this.reviewReportRepository.findOne({
      where: { reviewId, reportedBy: userId },
    });
    if (existingReport) {
      throw new BadRequestException('You have already reported this review');
    }

    // Create report
    const report = this.reviewReportRepository.create({
      reviewId,
      reportedBy: userId,
      reportReason: reportDto.reportReason,
      reportDetails: reportDto.reportDetails || null,
      status: ReportStatus.PENDING,
    });

    await this.reviewReportRepository.save(report);

    // Flag review for moderation if multiple reports
    const reportCount = await this.reviewReportRepository.count({
      where: { reviewId, status: ReportStatus.PENDING },
    });
    if (reportCount >= 3) {
      review.status = ReviewStatus.FLAGGED;
      await this.reviewRepository.save(review);

      // Notify CS agents about flagged review
      this.logger.log(`Review ${reviewId} flagged due to multiple reports (${reportCount} reports)`);
    }
  }

  /**
   * Create a reply to a review (by reviewee - seller/agent)
   */
  async createReply(revieweeId: string, reviewId: string, createDto: CreateReplyDto): Promise<ReviewReply> {
    const review = await this.reviewRepository.findOne({ where: { id: reviewId } });
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Only reviewee can reply
    if (review.revieweeId !== revieweeId) {
      throw new ForbiddenException('Only the reviewee (seller/agent) can reply to this review');
    }

    // Check if reply already exists
    const existingReply = await this.reviewReplyRepository.findOne({
      where: { reviewId, repliedBy: revieweeId, deletedAt: IsNull() },
    });
    if (existingReply) {
      throw new BadRequestException('You have already replied to this review');
    }

    // Create reply (pending moderation)
    const reply = this.reviewReplyRepository.create({
      reviewId,
      repliedBy: revieweeId,
      replyText: createDto.replyText,
      status: ReplyStatus.PENDING,
    });

    const savedReply = await this.reviewReplyRepository.save(reply);

    // Notify reviewer about reply
    this.notificationsService
      .sendNotification(
        review.reviewerId,
        'CS_FOLLOWUP' as any, // Using existing notification type as fallback
        'Reply to Your Review',
        `The seller/agent has replied to your review.`,
        {
          data: { reviewId, replyId: savedReply.id },
          priority: 'normal' as any,
        },
      )
      .catch((error) => {
        this.logger.error(`Failed to send reply notification: ${error.message}`);
      });

    return savedReply;
  }

  /**
   * Map review entity to response DTO
   */
  private async mapToResponseDto(review: Review, userId?: string): Promise<ReviewResponseDto> {
    // Load relations if not already loaded
    if (!review.reviewer || !review.reviewee) {
      const fullReview = await this.reviewRepository.findOne({
        where: { id: review.id },
        relations: ['reviewer', 'reviewee', 'property'],
      });
      if (fullReview) {
        review.reviewer = fullReview.reviewer;
        review.reviewee = fullReview.reviewee;
        review.property = fullReview.property;
      }
    }

    // Check if user has voted
    let hasUserVoted = false;
    let userVoteIsHelpful = false;
    if (userId) {
      const vote = await this.helpfulVoteRepository.findOne({
        where: { reviewId: review.id, userId },
      });
      if (vote) {
        hasUserVoted = true;
        userVoteIsHelpful = vote.isHelpful;
      }
    }

    // Count approved replies
    const repliesCount = await this.reviewReplyRepository.count({
      where: { reviewId: review.id, status: ReplyStatus.APPROVED, deletedAt: IsNull() },
    });

    return {
      id: review.id,
      reviewerId: review.reviewerId,
      reviewerName: review.isAnonymous ? null : review.reviewer?.fullName || null,
      revieweeId: review.revieweeId,
      revieweeName: review.reviewee?.fullName || null,
      propertyId: review.propertyId || null,
      propertyTitle: review.property?.title || null,
      interestExpressionId: review.interestExpressionId || null,
      chatSessionId: review.chatSessionId || null,
      reviewType: review.reviewType,
      reviewContext: review.reviewContext,
      overallRating: Number(review.overallRating),
      propertyRating: review.propertyRating ? Number(review.propertyRating) : null,
      sellerRating: review.sellerRating ? Number(review.sellerRating) : null,
      responsivenessRating: review.responsivenessRating ? Number(review.responsivenessRating) : null,
      communicationRating: review.communicationRating ? Number(review.communicationRating) : null,
      professionalismRating: review.professionalismRating ? Number(review.professionalismRating) : null,
      title: review.title,
      comment: review.comment,
      pros: review.pros,
      cons: review.cons,
      sentimentScore: review.sentimentScore ? Number(review.sentimentScore) : null,
      sentimentLabel: review.sentimentLabel || null,
      fakeReviewScore: review.fakeReviewScore ? Number(review.fakeReviewScore) : null,
      fakeReviewDetected: review.fakeReviewDetected,
      fakeReviewReasons: review.fakeReviewReasons,
      aiConfidence: review.aiConfidence ? Number(review.aiConfidence) : null,
      status: review.status,
      helpfulCount: review.helpfulCount,
      notHelpfulCount: review.notHelpfulCount,
      isVerifiedPurchase: review.isVerifiedPurchase,
      isAnonymous: review.isAnonymous,
      isEdited: review.isEdited,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      hasUserVoted,
      userVoteIsHelpful,
      repliesCount,
    };
  }
}
