import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  /**
   * Get subscription status
   * GET /api/subscriptions/status
   */
  @Get('status')
  async getStatus(@CurrentUser() currentUser: CurrentUserData) {
    return this.subscriptionsService.getUserSubscriptionStatus(currentUser.userId);
  }

  /**
   * Get premium features
   * GET /api/subscriptions/features
   */
  @Get('features')
  async getFeatures(@CurrentUser() currentUser: CurrentUserData) {
    const status = await this.subscriptionsService.getUserSubscriptionStatus(currentUser.userId);
    
    return {
      premiumFeatures: {
        priorityListing: status.hasPremiumSeller,
        fasterMediation: status.hasPremiumSeller || status.hasPremiumBuyer,
        featuredBadge: status.hasActiveFeaturedListing,
        advancedSearch: status.hasPremiumBuyer,
        propertyAlerts: status.hasPremiumBuyer,
      },
      subscriptionStatus: status,
    };
  }

  /**
   * Get user's active subscriptions
   * GET /api/subscriptions
   */
  @Get()
  async getUserSubscriptions(@CurrentUser() currentUser: CurrentUserData) {
    return this.subscriptionsService.getUserSubscriptions(currentUser.userId);
  }

  /**
   * Cancel subscription
   * PUT /api/subscriptions/:id/cancel
   */
  @Put(':id/cancel')
  async cancelSubscription(
    @CurrentUser() currentUser: CurrentUserData,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { reason?: string },
  ) {
    return this.subscriptionsService.cancelSubscription(currentUser.userId, id, body.reason);
  }

  /**
   * Update auto-renewal
   * PUT /api/subscriptions/:id/auto-renewal
   */
  @Put(':id/auto-renewal')
  async updateAutoRenewal(
    @CurrentUser() currentUser: CurrentUserData,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { enabled: boolean },
  ) {
    return this.subscriptionsService.updateAutoRenewal(currentUser.userId, id, body.enabled);
  }
}
