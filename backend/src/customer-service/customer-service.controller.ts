import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CustomerServiceService } from './customer-service.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CurrentUserData } from '../auth/decorators/current-user.decorator';
import { VerifyPropertyDto } from './dto/verify-property.dto';
import { PendingVerificationFilterDto } from './dto/pending-verification-filter.dto';

@Controller('customer-service')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('customer_service', 'admin')
export class CustomerServiceController {
  constructor(private readonly customerServiceService: CustomerServiceService) {}

  /**
   * Get pending properties for verification (CS Dashboard)
   * GET /api/customer-service/pending
   */
  @Get('pending')
  getPendingVerifications(
    @CurrentUser() currentUser: CurrentUserData,
    @Query() filterDto: PendingVerificationFilterDto,
  ) {
    return this.customerServiceService.getPendingVerifications(
      currentUser.userId,
      filterDto,
    );
  }

  /**
   * Get a specific property for verification with full details
   * GET /api/customer-service/properties/:propertyId
   */
  @Get('properties/:propertyId')
  getPropertyForVerification(
    @CurrentUser() currentUser: CurrentUserData,
    @Param('propertyId', ParseUUIDPipe) propertyId: string,
  ) {
    return this.customerServiceService.getPropertyForVerification(
      currentUser.userId,
      propertyId,
    );
  }

  /**
   * Verify a property (approve or reject)
   * POST /api/customer-service/verify
   */
  @Post('verify')
  verifyProperty(
    @CurrentUser() currentUser: CurrentUserData,
    @Body() verifyDto: VerifyPropertyDto,
  ) {
    return this.customerServiceService.verifyProperty(
      currentUser.userId,
      verifyDto,
    );
  }

  /**
   * Get CS agent statistics (for dashboard)
   * GET /api/customer-service/stats
   */
  @Get('stats')
  getCsAgentStats(@CurrentUser() currentUser: CurrentUserData) {
    return this.customerServiceService.getCsAgentStats(currentUser.userId);
  }

  /**
   * Reassign property to another CS agent (admin only)
   * POST /api/customer-service/reassign/:propertyId
   */
  @Post('reassign/:propertyId')
  @Roles('admin')
  reassignProperty(
    @CurrentUser() currentUser: CurrentUserData,
    @Param('propertyId', ParseUUIDPipe) propertyId: string,
    @Body() body: { newCsAgentId: string },
  ) {
    return this.customerServiceService.reassignProperty(
      currentUser.userId,
      propertyId,
      body.newCsAgentId,
    );
  }
}
