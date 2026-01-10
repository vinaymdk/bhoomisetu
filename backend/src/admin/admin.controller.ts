import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { UserFilterDto } from './dto/user-filter.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AdminDashboardStatsDto } from './dto/admin-dashboard.dto';
import { PaymentReportFilterDto } from './dto/payment-report-filter.dto';
import { AiMetricsFilterDto } from './dto/ai-metrics-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * USER MANAGEMENT
   */

  /**
   * Get admin dashboard statistics
   */
  @Get('dashboard/stats')
  async getDashboardStats(@CurrentUser() currentUser: CurrentUserData): Promise<AdminDashboardStatsDto> {
    return this.adminService.getDashboardStats(currentUser.userId);
  }

  /**
   * Get all users with filters (Admin only)
   */
  @Get('users')
  async getAllUsers(
    @CurrentUser() currentUser: CurrentUserData,
    @Query() filterDto: UserFilterDto,
  ) {
    return this.adminService.getAllUsers(currentUser.userId, filterDto);
  }

  /**
   * Get user by ID (Admin only)
   */
  @Get('users/:id')
  async getUserById(@CurrentUser() currentUser: CurrentUserData, @Param('id') userId: string) {
    return this.adminService.getUserById(currentUser.userId, userId);
  }

  /**
   * Update user (Admin only)
   */
  @Patch('users/:id')
  async updateUser(
    @CurrentUser() currentUser: CurrentUserData,
    @Param('id') userId: string,
    @Body() updateDto: UpdateUserDto,
  ) {
    return this.adminService.updateUser(currentUser.userId, userId, updateDto);
  }

  /**
   * Suspend user (Admin only)
   */
  @Post('users/:id/suspend')
  async suspendUser(
    @CurrentUser() currentUser: CurrentUserData,
    @Param('id') userId: string,
    @Body() body: { reason?: string },
  ) {
    return this.adminService.suspendUser(currentUser.userId, userId, body.reason);
  }

  /**
   * Activate user (Admin only)
   */
  @Post('users/:id/activate')
  async activateUser(@CurrentUser() currentUser: CurrentUserData, @Param('id') userId: string) {
    return this.adminService.activateUser(currentUser.userId, userId);
  }

  /**
   * Delete user (soft delete, Admin only)
   */
  @Delete('users/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@CurrentUser() currentUser: CurrentUserData, @Param('id') userId: string) {
    return this.adminService.deleteUser(currentUser.userId, userId);
  }

  /**
   * PROPERTY APPROVALS
   */

  /**
   * Get all pending properties for approval (Admin can see all)
   */
  @Get('properties/pending')
  async getPendingProperties(
    @CurrentUser() currentUser: CurrentUserData,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.adminService.getPendingProperties(
      currentUser.userId,
      page ? parseInt(page.toString(), 10) : 1,
      limit ? parseInt(limit.toString(), 10) : 20,
    );
  }

  /**
   * Approve property (Admin override)
   */
  @Post('properties/:id/approve')
  async approveProperty(
    @CurrentUser() currentUser: CurrentUserData,
    @Param('id') propertyId: string,
    @Body() body: { notes?: string },
  ) {
    return this.adminService.approveProperty(currentUser.userId, propertyId, body.notes);
  }

  /**
   * Reject property (Admin override)
   */
  @Post('properties/:id/reject')
  async rejectProperty(
    @CurrentUser() currentUser: CurrentUserData,
    @Param('id') propertyId: string,
    @Body() body: { reason: string },
  ) {
    return this.adminService.rejectProperty(currentUser.userId, propertyId, body.reason);
  }

  /**
   * CS ACTIVITY LOGS
   */

  /**
   * Get all CS activity logs
   */
  @Get('cs/activity-logs')
  async getCsActivityLogs(
    @CurrentUser() currentUser: CurrentUserData,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('csAgentId') csAgentId?: string,
  ) {
    return this.adminService.getCsActivityLogs(
      currentUser.userId,
      page ? parseInt(page.toString(), 10) : 1,
      limit ? parseInt(limit.toString(), 10) : 20,
      csAgentId,
    );
  }

  /**
   * Get CS verification logs
   */
  @Get('cs/verification-logs')
  async getCsVerificationLogs(
    @CurrentUser() currentUser: CurrentUserData,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('csAgentId') csAgentId?: string,
  ) {
    return this.adminService.getCsVerificationLogs(
      currentUser.userId,
      page ? parseInt(page.toString(), 10) : 1,
      limit ? parseInt(limit.toString(), 10) : 20,
      csAgentId,
    );
  }

  /**
   * PAYMENT REPORTS
   */

  /**
   * Get payment reports
   */
  @Get('payments/reports')
  async getPaymentReports(
    @CurrentUser() currentUser: CurrentUserData,
    @Query() filterDto: PaymentReportFilterDto,
  ) {
    return this.adminService.getPaymentReports(currentUser.userId, filterDto);
  }

  /**
   * AI PERFORMANCE METRICS
   */

  /**
   * Get AI performance metrics
   */
  @Get('ai/metrics')
  async getAiMetrics(@CurrentUser() currentUser: CurrentUserData, @Query() filterDto: AiMetricsFilterDto) {
    return this.adminService.getAiMetrics(currentUser.userId, filterDto);
  }

  /**
   * REVIEW MODERATION
   */

  /**
   * Get flagged reviews for moderation
   */
  @Get('reviews/flagged')
  async getFlaggedReviews(
    @CurrentUser() currentUser: CurrentUserData,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.adminService.getFlaggedReviews(
      currentUser.userId,
      page ? parseInt(page.toString(), 10) : 1,
      limit ? parseInt(limit.toString(), 10) : 20,
    );
  }

  /**
   * Approve flagged review (Admin only)
   */
  @Post('reviews/:id/approve')
  async approveReview(
    @CurrentUser() currentUser: CurrentUserData,
    @Param('id') reviewId: string,
    @Body() body: { notes?: string },
  ) {
    return this.adminService.approveReview(currentUser.userId, reviewId, body.notes);
  }

  /**
   * Reject flagged review (Admin only)
   */
  @Post('reviews/:id/reject')
  async rejectReview(
    @CurrentUser() currentUser: CurrentUserData,
    @Param('id') reviewId: string,
    @Body() body: { reason: string },
  ) {
    return this.adminService.rejectReview(currentUser.userId, reviewId, body.reason);
  }

  /**
   * Hide review (Admin only)
   */
  @Post('reviews/:id/hide')
  async hideReview(
    @CurrentUser() currentUser: CurrentUserData,
    @Param('id') reviewId: string,
    @Body() body: { reason: string },
  ) {
    return this.adminService.hideReview(currentUser.userId, reviewId, body.reason);
  }

  /**
   * Get all review reports
   */
  @Get('reviews/reports')
  async getReviewReports(
    @CurrentUser() currentUser: CurrentUserData,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    return this.adminService.getReviewReports(
      currentUser.userId,
      page ? parseInt(page.toString(), 10) : 1,
      limit ? parseInt(limit.toString(), 10) : 20,
      status,
    );
  }
}
