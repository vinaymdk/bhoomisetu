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
import { Repository, FindOptionsWhere, Like, IsNull, Between, In, MoreThan, LessThan, Or } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../auth/entities/user-role.entity';
import { Role } from '../auth/entities/role.entity';
import { Property, PropertyStatus } from '../properties/entities/property.entity';
import { PropertyVerificationNote } from '../properties/entities/property-verification-note.entity';
import { CsMediationAction, MediationActionType } from '../mediation/entities/cs-mediation-action.entity';
import { InterestExpression, ConnectionStatus } from '../mediation/entities/interest-expression.entity';
import { Payment, PaymentStatus } from '../payments/entities/payment.entity';
import { Subscription, SubscriptionStatus } from '../subscriptions/entities/subscription.entity';
import { Review, ReviewStatus } from '../reviews/entities/review.entity';
import { ReviewReport } from '../reviews/entities/review-report.entity';
import { LoginSession } from '../auth/entities/login-session.entity';
import { BuyerRequirement } from '../buyer-requirements/entities/buyer-requirement.entity';
import { PropertyRequirementMatch } from '../buyer-requirements/entities/property-requirement-match.entity';
import { UserFilterDto, UserStatus } from './dto/user-filter.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AdminDashboardStatsDto } from './dto/admin-dashboard.dto';
import { PaymentReportFilterDto } from './dto/payment-report-filter.dto';
import { AiMetricsFilterDto, AiMetricType } from './dto/ai-metrics-filter.dto';
import { UsersService } from '../users/users.service';
import { CustomerServiceService } from '../customer-service/customer-service.service';
import { PropertiesService } from '../properties/properties.service';
import { VerifyPropertyDto } from '../customer-service/dto/verify-property.dto';
import { UrgencyLevel } from '../properties/entities/property-verification-note.entity';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    @InjectRepository(PropertyVerificationNote)
    private readonly verificationNoteRepository: Repository<PropertyVerificationNote>,
    @InjectRepository(CsMediationAction)
    private readonly csMediationActionRepository: Repository<CsMediationAction>,
    @InjectRepository(InterestExpression)
    private readonly interestExpressionRepository: Repository<InterestExpression>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(ReviewReport)
    private readonly reviewReportRepository: Repository<ReviewReport>,
    @InjectRepository(LoginSession)
    private readonly loginSessionRepository: Repository<LoginSession>,
    @InjectRepository(BuyerRequirement)
    private readonly buyerRequirementRepository: Repository<BuyerRequirement>,
    @InjectRepository(PropertyRequirementMatch)
    private readonly matchRepository: Repository<PropertyRequirementMatch>,
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => CustomerServiceService))
    private readonly customerServiceService: CustomerServiceService,
    @Inject(forwardRef(() => PropertiesService))
    private readonly propertiesService: PropertiesService,
  ) {}

  /**
   * Verify admin access
   */
  private async verifyAdminAccess(adminId: string): Promise<void> {
    const roles = await this.usersService.getUserRoles(adminId);
    if (!roles.includes('admin')) {
      throw new ForbiddenException('Only administrators can access this endpoint');
    }
  }

  /**
   * USER MANAGEMENT
   */

  /**
   * Get all users with filters (Admin only)
   */
  async getAllUsers(adminId: string, filterDto: UserFilterDto) {
    await this.verifyAdminAccess(adminId);

    const page = filterDto.page || 1;
    const limit = filterDto.limit || 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.userRoles', 'userRoles')
      .leftJoinAndSelect('userRoles.role', 'role')
      .where('user.deletedAt IS NULL');

    // Search filter
    if (filterDto.search) {
      queryBuilder.andWhere(
        '(user.fullName ILIKE :search OR user.primaryEmail ILIKE :search OR user.primaryPhone ILIKE :search)',
        { search: `%${filterDto.search}%` },
      );
    }

    // Status filter
    if (filterDto.status) {
      queryBuilder.andWhere('user.status = :status', { status: filterDto.status });
    }

    // Role filter
    if (filterDto.role) {
      queryBuilder.andWhere('role.code = :roleCode', { roleCode: filterDto.role });
    }

    // Fraud score filters
    if (filterDto.minFraudScore !== undefined) {
      queryBuilder.andWhere('user.fraudRiskScore >= :minFraudScore', { minFraudScore: filterDto.minFraudScore });
    }
    if (filterDto.maxFraudScore !== undefined) {
      queryBuilder.andWhere('user.fraudRiskScore <= :maxFraudScore', { maxFraudScore: filterDto.maxFraudScore });
    }

    // Sorting
    const sortBy = filterDto.sortBy || 'createdAt';
    const sortOrder = filterDto.sortOrder || 'DESC';
    queryBuilder.orderBy(`user.${sortBy}`, sortOrder);

    // Pagination
    queryBuilder.skip(skip).take(limit);

    const [users, total] = await queryBuilder.getManyAndCount();

    return {
      users,
      total,
      page,
      limit,
    };
  }

  /**
   * Get user by ID (Admin only)
   */
  async getUserById(adminId: string, userId: string) {
    await this.verifyAdminAccess(adminId);

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['userRoles', 'userRoles.role'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Update user (Admin only)
   */
  async updateUser(adminId: string, userId: string, updateDto: UpdateUserDto) {
    await this.verifyAdminAccess(adminId);

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update basic fields
    if (updateDto.fullName !== undefined) user.fullName = updateDto.fullName;
    if (updateDto.status !== undefined) user.status = updateDto.status as any;
    if (updateDto.fraudRiskScore !== undefined) user.fraudRiskScore = updateDto.fraudRiskScore;

    await this.userRepository.save(user);

    // Update roles if provided
    if (updateDto.roles && updateDto.roles.length > 0) {
      // Remove existing roles
      await this.userRoleRepository.delete({ userId });

      // Add new roles
      for (const roleCode of updateDto.roles) {
        const role = await this.roleRepository.findOne({ where: { code: roleCode } });
        if (role) {
          const userRole = this.userRoleRepository.create({
            userId: user.id,
            roleId: role.id,
            assignedBy: adminId,
          });
          await this.userRoleRepository.save(userRole);
        }
      }
    }

    // Reload user with updated relations
    return await this.getUserById(adminId, userId);
  }

  /**
   * Suspend user (Admin only)
   */
  async suspendUser(adminId: string, userId: string, reason?: string) {
    await this.verifyAdminAccess(adminId);

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.status = 'suspended' as any;
    // TODO: Add suspensionReason field to User entity if needed
    await this.userRepository.save(user);

    this.logger.log(`User ${userId} suspended by admin ${adminId}. Reason: ${reason || 'No reason provided'}`);
    return user;
  }

  /**
   * Activate user (Admin only)
   */
  async activateUser(adminId: string, userId: string) {
    await this.verifyAdminAccess(adminId);

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.status = 'active' as any;
    await this.userRepository.save(user);

    this.logger.log(`User ${userId} activated by admin ${adminId}`);
    return user;
  }

  /**
   * Delete user (soft delete, Admin only)
   */
  async deleteUser(adminId: string, userId: string) {
    await this.verifyAdminAccess(adminId);

    // Prevent self-deletion
    if (adminId === userId) {
      throw new BadRequestException('You cannot delete your own account');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.softDelete(userId);

    this.logger.log(`User ${userId} deleted (soft) by admin ${adminId}`);
    return { message: 'User deleted successfully' };
  }

  /**
   * ADMIN DASHBOARD
   */

  /**
   * Get admin dashboard statistics
   */
  async getDashboardStats(adminId: string): Promise<AdminDashboardStatsDto> {
    await this.verifyAdminAccess(adminId);

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // User Statistics
    const totalUsers = await this.userRepository.count({ where: { deletedAt: IsNull() } });
    const activeUsers = await this.userRepository.count({ where: { status: 'active' as any, deletedAt: IsNull() } });
    const suspendedUsers = await this.userRepository.count({ where: { status: 'suspended' as any, deletedAt: IsNull() } });
    const newUsersToday = await this.userRepository
      .createQueryBuilder('user')
      .where('user.deletedAt IS NULL')
      .andWhere('user.createdAt >= :todayStart', { todayStart })
      .getCount();
    const newUsersThisWeek = await this.userRepository
      .createQueryBuilder('user')
      .where('user.deletedAt IS NULL')
      .andWhere('user.createdAt >= :weekStart', { weekStart })
      .getCount();
    const newUsersThisMonth = await this.userRepository
      .createQueryBuilder('user')
      .where('user.deletedAt IS NULL')
      .andWhere('user.createdAt >= :monthStart', { monthStart })
      .getCount();

    // Property Statistics
    const totalProperties = await this.propertyRepository.count({ where: { deletedAt: IsNull() } });
    const liveProperties = await this.propertyRepository.count({
      where: { status: PropertyStatus.LIVE, deletedAt: IsNull() },
    });
    const pendingVerificationProperties = await this.propertyRepository.count({
      where: { status: PropertyStatus.PENDING_VERIFICATION, deletedAt: IsNull() },
    });
    const rejectedProperties = await this.propertyRepository.count({
      where: { status: PropertyStatus.REJECTED, deletedAt: IsNull() },
    });
    const featuredProperties = await this.propertyRepository.count({
      where: { isFeatured: true, status: PropertyStatus.LIVE, deletedAt: IsNull() },
    });

    // CS Activity Statistics
    const totalCSActions = await this.csMediationActionRepository.count();
    const csActionsToday = await this.csMediationActionRepository
      .createQueryBuilder('action')
      .where('action.createdAt >= :todayStart', { todayStart })
      .getCount();
    const pendingMediations = await this.interestExpressionRepository.count({
      where: { connectionStatus: In([ConnectionStatus.PENDING, ConnectionStatus.CS_REVIEWING, ConnectionStatus.SELLER_CHECKING]), deletedAt: IsNull() },
    });
    const completedMediations = await this.interestExpressionRepository.count({
      where: { connectionStatus: ConnectionStatus.CONNECTED, deletedAt: IsNull() },
    });

    // Payment Statistics
    const allPayments = await this.paymentRepository.find();
    const totalRevenue = allPayments
      .filter((p) => p.status === PaymentStatus.COMPLETED)
      .reduce((sum, p) => sum + Number(p.amount), 0);
    const revenueToday = allPayments
      .filter((p) => p.status === PaymentStatus.COMPLETED && p.completedAt && p.completedAt >= todayStart)
      .reduce((sum, p) => sum + Number(p.amount), 0);
    const revenueThisWeek = allPayments
      .filter((p) => p.status === PaymentStatus.COMPLETED && p.completedAt && p.completedAt >= weekStart)
      .reduce((sum, p) => sum + Number(p.amount), 0);
    const revenueThisMonth = allPayments
      .filter((p) => p.status === PaymentStatus.COMPLETED && p.completedAt && p.completedAt >= monthStart)
      .reduce((sum, p) => sum + Number(p.amount), 0);
    const activeSubscriptions = await this.subscriptionRepository.count({
      where: { status: SubscriptionStatus.ACTIVE },
    });
    const failedPayments = await this.paymentRepository.count({
      where: { status: PaymentStatus.FAILED },
    });
    // Count payments with high fraud risk (> 70) or fraud indicators
    const highFraudPayments = await this.paymentRepository
      .createQueryBuilder('payment')
      .where(
        '(payment.fraudRiskScore > 70 OR payment.duplicateCardDetected = true OR payment.locationMismatchDetected = true)',
      )
      .getCount();
    const fraudulentPayments = highFraudPayments;

    // AI Performance Statistics
    const allPaymentsWithAI = await this.paymentRepository.find({
      where: { aiCheckPerformed: true },
    });
    const aiFraudChecksTotal = allPaymentsWithAI.length;
    const aiFraudChecksToday = allPaymentsWithAI.filter((p) => p.createdAt >= todayStart).length;
    const aiFraudScoreAverage =
      allPaymentsWithAI.length > 0
        ? allPaymentsWithAI.reduce((sum, p) => sum + (p.fraudRiskScore || 0), 0) / allPaymentsWithAI.length
        : 0;

    const allReviews = await this.reviewRepository.find({ where: { aiAnalysisPerformed: true, deletedAt: IsNull() } });
    const aiSentimentAnalysisTotal = allReviews.length;
    const aiFakeReviewDetectionsTotal = await this.reviewRepository.count({
      where: { fakeReviewDetected: true, deletedAt: IsNull() },
    });
    const aiFakeReviewDetectionsToday = await this.reviewRepository
      .createQueryBuilder('review')
      .where('review.fakeReviewDetected = :fakeDetected', { fakeDetected: true })
      .andWhere('review.createdAt >= :todayStart', { todayStart })
      .andWhere('review.deletedAt IS NULL')
      .getCount();
    const fakeReviewScores = allReviews.filter((r) => r.fakeReviewScore !== null).map((r) => Number(r.fakeReviewScore || 0));
    const aiFakeReviewScoreAverage = fakeReviewScores.length > 0 ? fakeReviewScores.reduce((sum, score) => sum + score, 0) / fakeReviewScores.length : 0;

    // Review Statistics
    const totalReviews = await this.reviewRepository.count({ where: { deletedAt: IsNull() } });
    const approvedReviews = await this.reviewRepository.count({
      where: { status: ReviewStatus.APPROVED, deletedAt: IsNull() },
    });
    const flaggedReviews = await this.reviewRepository.count({
      where: { status: ReviewStatus.FLAGGED, deletedAt: IsNull() },
    });
    const approvedReviewsWithRating = await this.reviewRepository.find({
      where: { status: ReviewStatus.APPROVED, deletedAt: IsNull() },
    });
    const averageRating =
      approvedReviewsWithRating.length > 0
        ? approvedReviewsWithRating.reduce((sum, r) => sum + Number(r.overallRating), 0) / approvedReviewsWithRating.length
        : 0;

    // Buyer Requirements Statistics
    const totalBuyerRequirements = await this.buyerRequirementRepository.count({ where: { deletedAt: IsNull() } });
    const activeBuyerRequirements = await this.buyerRequirementRepository.count({
      where: { deletedAt: IsNull() },
    }); // TODO: Add active status field
    const totalMatches = await this.matchRepository.count();

    return {
      // User Statistics
      totalUsers,
      activeUsers,
      suspendedUsers,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,

      // Property Statistics
      totalProperties,
      liveProperties,
      pendingVerificationProperties,
      rejectedProperties,
      featuredProperties,

      // CS Activity Statistics
      totalCSActions,
      csActionsToday,
      pendingMediations,
      completedMediations,

      // Payment Statistics
      totalRevenue,
      revenueToday,
      revenueThisWeek,
      revenueThisMonth,
      activeSubscriptions,
      failedPayments,
      fraudulentPayments: fraudulentPayments || 0, // Fix: payments don't have fakeReviewDetected, reviews do

      // AI Performance Statistics
      aiFraudChecksTotal,
      aiFraudChecksToday,
      aiFraudScoreAverage,
      aiSentimentAnalysisTotal,
      aiFakeReviewDetectionsTotal,
      aiFakeReviewDetectionsToday,
      aiFakeReviewScoreAverage,

      // Review Statistics
      totalReviews,
      approvedReviews,
      flaggedReviews,
      averageRating,

      // Buyer Requirements Statistics
      totalBuyerRequirements,
      activeBuyerRequirements,
      totalMatches,
    };
  }

  /**
   * PROPERTY APPROVALS (Admin override)
   */

  /**
   * Get all pending properties for approval (Admin can see all)
   */
  async getPendingProperties(adminId: string, page: number = 1, limit: number = 20) {
    await this.verifyAdminAccess(adminId);

    // Use CS service method but with admin override
    return this.customerServiceService.getPendingVerifications(adminId, {
      status: PropertyStatus.PENDING_VERIFICATION,
      page,
      limit,
    });
  }

  /**
   * Approve property (Admin override)
   */
  async approveProperty(adminId: string, propertyId: string, notes?: string) {
    await this.verifyAdminAccess(adminId);

    const verifyDto: VerifyPropertyDto = {
      propertyId,
      action: 'approve',
      urgencyLevel: UrgencyLevel.NORMAL,
      negotiationNotes: notes || undefined,
      remarks: `Admin approval by ${adminId}`,
    };

    // Use CS service method but with admin override
    return this.customerServiceService.verifyProperty(adminId, verifyDto);
  }

  /**
   * Reject property (Admin override)
   */
  async rejectProperty(adminId: string, propertyId: string, reason: string) {
    await this.verifyAdminAccess(adminId);

    const verifyDto: VerifyPropertyDto = {
      propertyId,
      action: 'reject',
      urgencyLevel: UrgencyLevel.NORMAL,
      negotiationNotes: undefined,
      remarks: `Admin rejection: ${reason}`,
      rejectionReason: reason,
    };

    // Use CS service method but with admin override
    return this.customerServiceService.verifyProperty(adminId, verifyDto);
  }

  /**
   * CS ACTIVITY LOGS
   */

  /**
   * Get all CS activity logs
   */
  async getCsActivityLogs(adminId: string, page: number = 1, limit: number = 20, csAgentId?: string) {
    await this.verifyAdminAccess(adminId);

    const skip = (page - 1) * limit;

    const queryBuilder = this.csMediationActionRepository
      .createQueryBuilder('action')
      .leftJoinAndSelect('action.csAgent', 'csAgent')
      .leftJoinAndSelect('action.interestExpression', 'interestExpression');

    if (csAgentId) {
      queryBuilder.andWhere('action.csAgentId = :csAgentId', { csAgentId });
    }

    queryBuilder.orderBy('action.createdAt', 'DESC').skip(skip).take(limit);

    const [actions, total] = await queryBuilder.getManyAndCount();

    return {
      actions,
      total,
      page,
      limit,
    };
  }

  /**
   * Get CS verification logs
   */
  async getCsVerificationLogs(adminId: string, page: number = 1, limit: number = 20, csAgentId?: string) {
    await this.verifyAdminAccess(adminId);

    const skip = (page - 1) * limit;

    const queryBuilder = this.verificationNoteRepository
      .createQueryBuilder('note')
      .leftJoinAndSelect('note.csAgent', 'csAgent')
      .leftJoinAndSelect('note.property', 'property');

    if (csAgentId) {
      queryBuilder.andWhere('note.csAgentId = :csAgentId', { csAgentId });
    }

    queryBuilder.orderBy('note.verifiedAt', 'DESC').skip(skip).take(limit);

    const [notes, total] = await queryBuilder.getManyAndCount();

    return {
      notes,
      total,
      page,
      limit,
    };
  }

  /**
   * PAYMENT REPORTS
   */

  /**
   * Get payment reports
   */
  async getPaymentReports(adminId: string, filterDto: PaymentReportFilterDto) {
    await this.verifyAdminAccess(adminId);

    const page = filterDto.page || 1;
    const limit = filterDto.limit || 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.user', 'user')
      .leftJoinAndSelect('payment.paymentMethod', 'paymentMethod');

    // Date range filter
    if (filterDto.startDate || filterDto.endDate) {
      const startDate = filterDto.startDate ? new Date(filterDto.startDate) : undefined;
      const endDate = filterDto.endDate ? new Date(filterDto.endDate) : undefined;

      if (startDate && endDate) {
        queryBuilder.andWhere('payment.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate });
      } else if (startDate) {
        queryBuilder.andWhere('payment.createdAt >= :startDate', { startDate });
      } else if (endDate) {
        queryBuilder.andWhere('payment.createdAt <= :endDate', { endDate });
      }
    }

    // Status filter
    if (filterDto.status) {
      queryBuilder.andWhere('payment.status = :status', { status: filterDto.status });
    }

    // Gateway filter
    if (filterDto.gateway) {
      queryBuilder.andWhere('payment.gateway = :gateway', { gateway: filterDto.gateway });
    }

    // Fraud detected filter (high fraud risk payments)
    if (filterDto.fraudDetected !== undefined) {
      if (filterDto.fraudDetected) {
        queryBuilder.andWhere(
          '(payment.aiCheckPerformed = :aiCheck AND payment.fraudRiskScore > 50 OR payment.duplicateCardDetected = true OR payment.locationMismatchDetected = true)',
          {
            aiCheck: true,
          },
        );
      } else {
        queryBuilder.andWhere('(payment.fraudRiskScore IS NULL OR payment.fraudRiskScore <= 50)');
      }
    }

    queryBuilder.orderBy('payment.createdAt', 'DESC').skip(skip).take(limit);

    const [payments, total] = await queryBuilder.getManyAndCount();

    // Calculate summary statistics
    const totalAmount = payments
      .filter((p) => p.status === PaymentStatus.COMPLETED)
      .reduce((sum, p) => sum + Number(p.amount), 0);
    const completedCount = payments.filter((p) => p.status === PaymentStatus.COMPLETED).length;
    const failedCount = payments.filter((p) => p.status === PaymentStatus.FAILED).length;

    return {
      payments,
      total,
      page,
      limit,
      summary: {
        totalAmount,
        completedCount,
        failedCount,
        totalCount: payments.length,
      },
    };
  }

  /**
   * AI PERFORMANCE METRICS
   */

  /**
   * Get AI performance metrics
   */
  async getAiMetrics(adminId: string, filterDto: AiMetricsFilterDto) {
    await this.verifyAdminAccess(adminId);

    const startDate = filterDto.startDate ? new Date(filterDto.startDate) : undefined;
    const endDate = filterDto.endDate ? new Date(filterDto.endDate) : undefined;

    const metrics: any = {};

    // Fraud Detection Metrics
    if (!filterDto.metricType || filterDto.metricType === AiMetricType.FRAUD_DETECTION) {
      const fraudQueryBuilder = this.paymentRepository
        .createQueryBuilder('payment')
        .where('payment.aiCheckPerformed = :aiCheck', { aiCheck: true });

      if (startDate && endDate) {
        fraudQueryBuilder.andWhere('payment.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate });
      } else if (startDate) {
        fraudQueryBuilder.andWhere('payment.createdAt >= :startDate', { startDate });
      } else if (endDate) {
        fraudQueryBuilder.andWhere('payment.createdAt <= :endDate', { endDate });
      }

      const fraudChecks = await fraudQueryBuilder.getMany();
      const fraudScores = fraudChecks.map((p) => p.fraudRiskScore || 0);
      const highRiskCount = fraudChecks.filter((p) => (p.fraudRiskScore || 0) > 70).length;
      const blockedCount = fraudChecks.filter((p) => (p.fraudRiskScore || 0) > 70).length; // Payments blocked if > 70

      metrics.fraudDetection = {
        total: fraudChecks.length,
        averageScore: fraudScores.length > 0 ? fraudScores.reduce((sum, score) => sum + score, 0) / fraudScores.length : 0,
        highRiskCount,
        blockedCount,
        lowRiskCount: fraudChecks.filter((p) => (p.fraudRiskScore || 0) < 30).length,
        mediumRiskCount: fraudChecks.filter((p) => {
          const score = p.fraudRiskScore || 0;
          return score >= 30 && score <= 70;
        }).length,
      };
    }

    // Sentiment Analysis Metrics
    if (!filterDto.metricType || filterDto.metricType === AiMetricType.SENTIMENT_ANALYSIS) {
      const sentimentQueryBuilder = this.reviewRepository
        .createQueryBuilder('review')
        .where('review.aiAnalysisPerformed = :aiCheck', { aiCheck: true })
        .andWhere('review.deletedAt IS NULL');

      if (startDate && endDate) {
        sentimentQueryBuilder.andWhere('review.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate });
      } else if (startDate) {
        sentimentQueryBuilder.andWhere('review.createdAt >= :startDate', { startDate });
      } else if (endDate) {
        sentimentQueryBuilder.andWhere('review.createdAt <= :endDate', { endDate });
      }

      const sentimentReviews = await sentimentQueryBuilder.getMany();
      const sentimentScores = sentimentReviews.filter((r) => r.sentimentScore !== null).map((r) => Number(r.sentimentScore || 0));
      const positiveCount = sentimentReviews.filter((r) => r.sentimentLabel === 'positive').length;
      const negativeCount = sentimentReviews.filter((r) => r.sentimentLabel === 'negative').length;
      const neutralCount = sentimentReviews.filter((r) => r.sentimentLabel === 'neutral').length;
      const mixedCount = sentimentReviews.filter((r) => r.sentimentLabel === 'mixed').length;

      metrics.sentimentAnalysis = {
        total: sentimentReviews.length,
        averageScore: sentimentScores.length > 0 ? sentimentScores.reduce((sum, score) => sum + score, 0) / sentimentScores.length : 0,
        positiveCount,
        negativeCount,
        neutralCount,
        mixedCount,
      };
    }

    // Fake Review Detection Metrics
    if (!filterDto.metricType || filterDto.metricType === AiMetricType.FAKE_REVIEW_DETECTION) {
      const fakeQueryBuilder = this.reviewRepository
        .createQueryBuilder('review')
        .where('review.fakeReviewDetected = :fakeDetected', { fakeDetected: true })
        .andWhere('review.deletedAt IS NULL');

      if (startDate && endDate) {
        fakeQueryBuilder.andWhere('review.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate });
      } else if (startDate) {
        fakeQueryBuilder.andWhere('review.createdAt >= :startDate', { startDate });
      } else if (endDate) {
        fakeQueryBuilder.andWhere('review.createdAt <= :endDate', { endDate });
      }

      const fakeReviews = await fakeQueryBuilder.getMany();
      const fakeScores = fakeReviews.filter((r) => r.fakeReviewScore !== null).map((r) => Number(r.fakeReviewScore || 0));
      const flaggedCount = fakeReviews.filter((r) => r.status === ReviewStatus.FLAGGED).length;

      metrics.fakeReviewDetection = {
        total: fakeReviews.length,
        averageScore: fakeScores.length > 0 ? fakeScores.reduce((sum, score) => sum + score, 0) / fakeScores.length : 0,
        flaggedCount,
        reasons: fakeReviews.reduce((acc, r) => {
          if (r.fakeReviewReasons) {
            r.fakeReviewReasons.forEach((reason) => {
              acc[reason] = (acc[reason] || 0) + 1;
            });
          }
          return acc;
        }, {} as Record<string, number>),
      };
    }

    return metrics;
  }

  /**
   * REVIEW MODERATION
   */

  /**
   * Get flagged reviews for moderation
   */
  async getFlaggedReviews(adminId: string, page: number = 1, limit: number = 20) {
    await this.verifyAdminAccess(adminId);

    const skip = (page - 1) * limit;

    const [reviews, total] = await this.reviewRepository.findAndCount({
      where: { status: ReviewStatus.FLAGGED, deletedAt: IsNull() },
      relations: ['reviewer', 'reviewee', 'property', 'reports'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      reviews,
      total,
      page,
      limit,
    };
  }

  /**
   * Approve flagged review (Admin only)
   */
  async approveReview(adminId: string, reviewId: string, notes?: string) {
    await this.verifyAdminAccess(adminId);

    const review = await this.reviewRepository.findOne({ where: { id: reviewId } });
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    review.status = ReviewStatus.APPROVED;
    review.moderatedBy = adminId;
    review.moderatedAt = new Date();
    review.moderationNotes = notes || null;

    await this.reviewRepository.save(review);

    this.logger.log(`Review ${reviewId} approved by admin ${adminId}`);
    return review;
  }

  /**
   * Reject flagged review (Admin only)
   */
  async rejectReview(adminId: string, reviewId: string, reason: string) {
    await this.verifyAdminAccess(adminId);

    const review = await this.reviewRepository.findOne({ where: { id: reviewId } });
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    review.status = ReviewStatus.REJECTED;
    review.moderatedBy = adminId;
    review.moderatedAt = new Date();
    review.moderationNotes = reason;

    await this.reviewRepository.save(review);

    this.logger.log(`Review ${reviewId} rejected by admin ${adminId}. Reason: ${reason}`);
    return review;
  }

  /**
   * Hide review (Admin only)
   */
  async hideReview(adminId: string, reviewId: string, reason: string) {
    await this.verifyAdminAccess(adminId);

    const review = await this.reviewRepository.findOne({ where: { id: reviewId } });
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    review.status = ReviewStatus.HIDDEN;
    review.moderatedBy = adminId;
    review.moderatedAt = new Date();
    review.moderationNotes = reason;

    await this.reviewRepository.save(review);

    this.logger.log(`Review ${reviewId} hidden by admin ${adminId}. Reason: ${reason}`);
    return review;
  }

  /**
   * Get all review reports
   */
  async getReviewReports(adminId: string, page: number = 1, limit: number = 20, status?: string) {
    await this.verifyAdminAccess(adminId);

    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<ReviewReport> = {};
    if (status) {
      where.status = status as any;
    }

    const [reports, total] = await this.reviewReportRepository.findAndCount({
      where,
      relations: ['review', 'reporter', 'reviewer'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      reports,
      total,
      page,
      limit,
    };
  }
}
