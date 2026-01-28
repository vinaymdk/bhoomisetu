export type SubscriptionType = 'premium_seller' | 'premium_buyer' | 'featured_listing';
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled';
export type BillingPeriod = 'monthly' | 'quarterly' | 'annual' | 'one_time';

export interface SubscriptionPlan {
  id: string;
  name: string;
  displayName: string;
  description?: string | null;
  planType: SubscriptionType;
  billingPeriod: BillingPeriod;
  price: number;
  currency: string;
  features: Record<string, boolean>;
  durationDays: number;
  isActive: boolean;
  isFeatured: boolean;
  metadata?: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  subscriptionType: SubscriptionType;
  status: SubscriptionStatus;
  startsAt: string;
  expiresAt: string;
  paymentId?: string | null;
  amountPaid?: number | null;
  subscriptionPlanId?: string | null;
  autoRenewalEnabled: boolean;
  nextBillingDate?: string | null;
  cancelledAt?: string | null;
  cancellationReason?: string | null;
  paymentMethodId?: string | null;
  metadata?: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
  plan?: SubscriptionPlan | null;
}

export interface SubscriptionStatusSummary {
  hasPremiumSeller: boolean;
  hasPremiumBuyer: boolean;
  hasActiveFeaturedListing: boolean;
  activeSubscriptions: Subscription[];
}

export interface PremiumFeatures {
  priorityListing: boolean;
  fasterMediation: boolean;
  featuredBadge: boolean;
  advancedSearch: boolean;
  propertyAlerts: boolean;
}

export interface PremiumFeaturesResponse {
  premiumFeatures: PremiumFeatures;
  subscriptionStatus: SubscriptionStatusSummary;
}
