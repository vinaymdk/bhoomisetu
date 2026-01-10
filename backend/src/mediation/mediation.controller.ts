import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  ParseEnumPipe,
} from '@nestjs/common';
import { MediationService } from './mediation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CurrentUserData } from '../auth/decorators/current-user.decorator';
import { ExpressInterestDto } from './dto/express-interest.dto';
import { CsReviewInterestDto } from './dto/cs-review-interest.dto';
import { ApproveConnectionDto } from './dto/approve-connection.dto';
import { MediationFilterDto } from './dto/mediation-filter.dto';
import { ConnectionStatus } from './entities/interest-expression.entity';

@Controller('mediation')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MediationController {
  constructor(private readonly mediationService: MediationService) {}

  /**
   * Buyer expresses interest in a property
   * POST /api/mediation/interest
   */
  @Post('interest')
  @Roles('buyer', 'admin')
  expressInterest(
    @CurrentUser() currentUser: CurrentUserData,
    @Body() expressDto: ExpressInterestDto,
  ) {
    return this.mediationService.expressInterest(currentUser.userId, expressDto);
  }

  /**
   * Get buyer's own interest expressions
   * GET /api/mediation/my-interests
   */
  @Get('my-interests')
  @Roles('buyer', 'admin')
  getMyInterests(
    @CurrentUser() currentUser: CurrentUserData,
    @Query() filterDto: MediationFilterDto,
  ) {
    return this.mediationService.getMyInterests(currentUser.userId, filterDto);
  }

  /**
   * Get interests in seller's properties
   * GET /api/mediation/property-interests
   */
  @Get('property-interests')
  @Roles('seller', 'agent', 'admin')
  getInterestsForMyProperties(
    @CurrentUser() currentUser: CurrentUserData,
    @Query() filterDto: MediationFilterDto,
  ) {
    return this.mediationService.getInterestsForMyProperties(currentUser.userId, filterDto);
  }

  /**
   * Get pending interest expressions (CS dashboard)
   * GET /api/mediation/pending
   */
  @Get('pending')
  @Roles('customer_service', 'admin')
  getPendingInterestExpressions(
    @CurrentUser() currentUser: CurrentUserData,
    @Query() filterDto: MediationFilterDto,
  ) {
    return this.mediationService.getPendingInterestExpressions(currentUser.userId, filterDto);
  }

  /**
   * Get single interest expression
   * GET /api/mediation/interests/:id
   */
  @Get('interests/:id')
  getInterestExpression(
    @CurrentUser() currentUser: CurrentUserData,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.mediationService.getInterestExpression(id, currentUser.userId);
  }

  /**
   * CS reviews buyer seriousness
   * POST /api/mediation/review/buyer-seriousness
   */
  @Post('review/buyer-seriousness')
  @Roles('customer_service', 'admin')
  reviewBuyerSeriousness(
    @CurrentUser() currentUser: CurrentUserData,
    @Body() reviewDto: CsReviewInterestDto,
  ) {
    return this.mediationService.reviewBuyerSeriousness(currentUser.userId, reviewDto);
  }

  /**
   * CS checks seller willingness
   * POST /api/mediation/review/seller-willingness
   */
  @Post('review/seller-willingness')
  @Roles('customer_service', 'admin')
  checkSellerWillingness(
    @CurrentUser() currentUser: CurrentUserData,
    @Body() reviewDto: CsReviewInterestDto,
  ) {
    return this.mediationService.checkSellerWillingness(currentUser.userId, reviewDto);
  }

  /**
   * CS approves connection (CRITICAL - enables chat/call and reveals contact)
   * POST /api/mediation/approve-connection
   */
  @Post('approve-connection')
  @Roles('customer_service', 'admin')
  approveConnection(
    @CurrentUser() currentUser: CurrentUserData,
    @Body() approveDto: ApproveConnectionDto,
  ) {
    return this.mediationService.approveConnection(currentUser.userId, approveDto);
  }

  /**
   * CS rejects connection
   * POST /api/mediation/reject-connection/:id
   */
  @Post('reject-connection/:id')
  @Roles('customer_service', 'admin')
  rejectConnection(
    @CurrentUser() currentUser: CurrentUserData,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { reason?: string },
  ) {
    return this.mediationService.rejectConnection(currentUser.userId, id, body.reason);
  }

  /**
   * Get chat session (only if connection approved)
   * GET /api/mediation/chat-sessions/:id
   */
  @Get('chat-sessions/:id')
  getChatSession(
    @CurrentUser() currentUser: CurrentUserData,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.mediationService.getChatSession(id, currentUser.userId);
  }

  /**
   * Send message in chat session
   * POST /api/mediation/chat-sessions/:id/messages
   */
  @Post('chat-sessions/:id/messages')
  sendMessage(
    @CurrentUser() currentUser: CurrentUserData,
    @Param('id', ParseUUIDPipe) sessionId: string,
    @Body() body: { content: string; messageType?: string },
  ) {
    return this.mediationService.sendMessage(
      sessionId,
      currentUser.userId,
      body.content,
      (body.messageType as any) || 'text',
    );
  }
}
