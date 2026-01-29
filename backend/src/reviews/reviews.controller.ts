import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Delete,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewFilterDto } from './dto/review-filter.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { ReportReviewDto } from './dto/report-review.dto';
import { CreateReplyDto } from './dto/create-reply.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';
import { ReviewReply } from './entities/review-reply.entity';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  /**
   * Create a new review (after viewing/deal)
   * Only buyers can create reviews after verified viewing/deal
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('buyer')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() currentUser: CurrentUserData,
    @Body() createDto: CreateReviewDto,
  ): Promise<ReviewResponseDto> {
    return this.reviewsService.createReview(currentUser.userId, createDto);
  }

  /**
   * Get all reviews with filters (public endpoint, but only approved reviews visible)
   */
  @Get()
  async findAll(
    @Query() filterDto: ReviewFilterDto,
    @CurrentUser() currentUser?: CurrentUserData,
  ): Promise<{
    reviews: ReviewResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.reviewsService.findAll(filterDto, currentUser?.userId);
  }

  /**
   * Get current user's reviews with filters (authenticated)
   */
  @Get('mine')
  @UseGuards(JwtAuthGuard)
  async findMine(
    @CurrentUser() currentUser: CurrentUserData,
    @Query() filterDto: ReviewFilterDto,
  ): Promise<{
    reviews: ReviewResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.reviewsService.findAll({ ...filterDto, reviewerId: currentUser.userId }, currentUser.userId);
  }

  /**
   * Get a single review by ID (public endpoint, but only approved reviews visible)
   */
  @Get(':id')
  async findOne(
    @Param('id') reviewId: string,
    @CurrentUser() currentUser?: CurrentUserData,
  ): Promise<ReviewResponseDto> {
    return this.reviewsService.findOne(reviewId, currentUser?.userId);
  }

  /**
   * Update a review (only by reviewer, before moderation)
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('buyer')
  async update(
    @CurrentUser() currentUser: CurrentUserData,
    @Param('id') reviewId: string,
    @Body() updateDto: UpdateReviewDto,
  ): Promise<ReviewResponseDto> {
    return this.reviewsService.updateReview(currentUser.userId, reviewId, updateDto);
  }

  /**
   * Delete a review (soft delete, only by reviewer)
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('buyer')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@CurrentUser() currentUser: CurrentUserData, @Param('id') reviewId: string): Promise<void> {
    // TODO: Implement soft delete
    throw new Error('Not implemented yet');
  }

  /**
   * Vote on review helpfulness
   */
  @Post(':id/helpful')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async voteHelpful(
    @CurrentUser() currentUser: CurrentUserData,
    @Param('id') reviewId: string,
    @Body() body: { isHelpful: boolean },
  ): Promise<void> {
    return this.reviewsService.voteHelpful(currentUser.userId, reviewId, body.isHelpful);
  }

  /**
   * Report a review
   */
  @Post(':id/report')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async reportReview(
    @CurrentUser() currentUser: CurrentUserData,
    @Param('id') reviewId: string,
    @Body() reportDto: ReportReviewDto,
  ): Promise<void> {
    return this.reviewsService.reportReview(currentUser.userId, reviewId, reportDto);
  }

  /**
   * Create a reply to a review (by reviewee - seller/agent)
   */
  @Post(':id/reply')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller', 'agent')
  @HttpCode(HttpStatus.CREATED)
  async createReply(
    @CurrentUser() currentUser: CurrentUserData,
    @Param('id') reviewId: string,
    @Body() createDto: CreateReplyDto,
  ): Promise<ReviewReply> {
    return this.reviewsService.createReply(currentUser.userId, reviewId, createDto);
  }

  /**
   * Get reviews for a specific property (public endpoint)
   */
  @Get('property/:propertyId')
  async findByProperty(
    @Param('propertyId') propertyId: string,
    @Query() filterDto: ReviewFilterDto,
    @CurrentUser() currentUser?: CurrentUserData,
  ): Promise<{
    reviews: ReviewResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.reviewsService.findAll({ ...filterDto, propertyId }, currentUser?.userId);
  }

  /**
   * Get reviews for a specific seller/agent (public endpoint)
   */
  @Get('seller/:revieweeId')
  async findBySeller(
    @Param('revieweeId') revieweeId: string,
    @Query() filterDto: ReviewFilterDto,
    @CurrentUser() currentUser?: CurrentUserData,
  ): Promise<{
    reviews: ReviewResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.reviewsService.findAll({ ...filterDto, revieweeId }, currentUser?.userId);
  }
}
