import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PropertiesService } from '../properties/properties.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

@Controller('home')
export class HomeController {
  constructor(
    private readonly propertiesService: PropertiesService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  async getHomeData(
    @Query('featuredLimit') featuredLimit?: number,
    @Query('newLimit') newLimit?: number,
    @CurrentUser() currentUser?: CurrentUserData,
  ) {
    const [featuredProperties, newProperties] = await Promise.all([
      this.propertiesService.findFeatured(
        featuredLimit ? parseInt(featuredLimit.toString(), 10) : 10,
        currentUser?.userId,
      ),
      this.propertiesService.findNew(
        newLimit ? parseInt(newLimit.toString(), 10) : 10,
        currentUser?.userId,
      ),
    ]);

    return {
      featuredProperties,
      newProperties,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  async getDashboard(@CurrentUser() currentUser: CurrentUserData) {
    const [featuredProperties, newProperties, subscriptionStatus] = await Promise.all([
      this.propertiesService.findFeatured(10, currentUser.userId),
      this.propertiesService.findNew(10, currentUser.userId),
      this.subscriptionsService.getUserSubscriptionStatus(currentUser.userId),
    ]);

    return {
      featuredProperties,
      newProperties,
      subscriptionStatus,
      premiumFeatures: {
        priorityListing: subscriptionStatus.hasPremiumSeller,
        fasterMediation: subscriptionStatus.hasPremiumSeller || subscriptionStatus.hasPremiumBuyer,
        featuredBadge: subscriptionStatus.hasActiveFeaturedListing,
        advancedSearch: subscriptionStatus.hasPremiumBuyer,
        propertyAlerts: subscriptionStatus.hasPremiumBuyer,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
