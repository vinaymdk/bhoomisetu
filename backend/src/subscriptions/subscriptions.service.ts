import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThanOrEqual, IsNull } from 'typeorm';
import { Subscription, SubscriptionType, SubscriptionStatus } from './entities/subscription.entity';
import { SubscriptionPlan, PlanType } from '../payments/entities/subscription-plan.entity';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    @InjectRepository(SubscriptionPlan)
    private readonly subscriptionPlanRepository: Repository<SubscriptionPlan>,
  ) {}

  async getUserSubscriptionStatus(userId: string): Promise<{
    hasPremiumSeller: boolean;
    hasPremiumBuyer: boolean;
    hasActiveFeaturedListing: boolean;
    activeSubscriptions: Subscription[];
  }> {
    const activeSubscriptions = await this.subscriptionRepository.find({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
        expiresAt: MoreThan(new Date()),
      },
    });

    return {
      hasPremiumSeller: activeSubscriptions.some(
        (sub) => sub.subscriptionType === SubscriptionType.PREMIUM_SELLER,
      ),
      hasPremiumBuyer: activeSubscriptions.some(
        (sub) => sub.subscriptionType === SubscriptionType.PREMIUM_BUYER,
      ),
      hasActiveFeaturedListing: activeSubscriptions.some(
        (sub) => sub.subscriptionType === SubscriptionType.FEATURED_LISTING,
      ),
      activeSubscriptions,
    };
  }

  async checkPremiumAccess(userId: string, subscriptionType: SubscriptionType): Promise<boolean> {
    const subscription = await this.subscriptionRepository.findOne({
      where: {
        userId,
        subscriptionType,
        status: SubscriptionStatus.ACTIVE,
        expiresAt: MoreThan(new Date()),
      },
    });

    return !!subscription;
  }

  /**
   * Check if user has premium seller features (priority listing, faster mediation, featured badge)
   */
  async hasPremiumSellerFeatures(userId: string): Promise<boolean> {
    return this.checkPremiumAccess(userId, SubscriptionType.PREMIUM_SELLER);
  }

  /**
   * Check if user has premium buyer features (faster mediation, advanced search, property alerts)
   */
  async hasPremiumBuyerFeatures(userId: string): Promise<boolean> {
    return this.checkPremiumAccess(userId, SubscriptionType.PREMIUM_BUYER);
  }

  /**
   * Check if property has featured listing
   */
  async hasFeaturedListing(propertyId: string): Promise<boolean> {
    const subscription = await this.subscriptionRepository.findOne({
      where: {
        subscriptionType: SubscriptionType.FEATURED_LISTING,
        status: SubscriptionStatus.ACTIVE,
        expiresAt: MoreThan(new Date()),
        metadata: { propertyId } as any,
      },
    });

    return !!subscription;
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(userId: string, subscriptionId: string, reason?: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id: subscriptionId, userId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    subscription.status = SubscriptionStatus.CANCELLED;
    subscription.cancelledAt = new Date();
    subscription.cancellationReason = reason || null;
    subscription.autoRenewalEnabled = false;
    subscription.nextBillingDate = null;

    return await this.subscriptionRepository.save(subscription);
  }

  /**
   * Enable/disable auto-renewal
   */
  async updateAutoRenewal(userId: string, subscriptionId: string, enabled: boolean): Promise<Subscription> {
      const subscription = await this.subscriptionRepository.findOne({
        where: { id: subscriptionId, userId },
        relations: ['plan'],
      });

      if (!subscription) {
        throw new NotFoundException('Subscription not found');
      }

      subscription.autoRenewalEnabled = enabled;
      
      if (enabled && subscription.expiresAt) {
        // Calculate next billing date based on plan duration
        let plan = subscription.plan;
        if (!plan && subscription.subscriptionPlanId) {
          plan = await this.subscriptionPlanRepository.findOne({
            where: { id: subscription.subscriptionPlanId },
          });
        }
        
        if (plan) {
          const nextBillingDate = new Date(subscription.expiresAt);
          subscription.nextBillingDate = nextBillingDate;
        }
      } else {
        subscription.nextBillingDate = null;
      }

      return await this.subscriptionRepository.save(subscription);
  }

  /**
   * Get user's active subscriptions
   */
  async getUserSubscriptions(userId: string): Promise<Subscription[]> {
    return this.subscriptionRepository.find({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
        expiresAt: MoreThan(new Date()),
      },
      relations: ['plan'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Check and expire subscriptions that have passed expiration date
   */
  async expireSubscriptions(): Promise<number> {
    const now = new Date();
    const expiredSubscriptions = await this.subscriptionRepository.find({
      where: {
        status: SubscriptionStatus.ACTIVE,
        expiresAt: LessThanOrEqual(now),
      },
    });

    for (const subscription of expiredSubscriptions) {
      subscription.status = SubscriptionStatus.EXPIRED;
      await this.subscriptionRepository.save(subscription);
      this.logger.log(`Subscription ${subscription.id} expired. User: ${subscription.userId}`);
    }

    return expiredSubscriptions.length;
  }
}
