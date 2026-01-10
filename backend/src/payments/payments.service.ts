import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Payment, PaymentStatus, PaymentPurpose, RelatedEntityType } from './entities/payment.entity';
import { PaymentMethod, PaymentGateway, CardBrand, CardType } from './entities/payment-method.entity';
import { SubscriptionPlan, PlanType } from './entities/subscription-plan.entity';
import { SubscriptionTransaction, TransactionType, TransactionStatus } from './entities/subscription-transaction.entity';
import { PaymentWebhook } from './entities/payment-webhook.entity';
import { Subscription, SubscriptionStatus, SubscriptionType } from '../subscriptions/entities/subscription.entity';
import { User } from '../users/entities/user.entity';
import { Property } from '../properties/entities/property.entity';
import { AiService } from '../ai/ai.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepository: Repository<PaymentMethod>,
    @InjectRepository(SubscriptionPlan)
    private readonly subscriptionPlanRepository: Repository<SubscriptionPlan>,
    @InjectRepository(SubscriptionTransaction)
    private readonly subscriptionTransactionRepository: Repository<SubscriptionTransaction>,
    @InjectRepository(PaymentWebhook)
    private readonly paymentWebhookRepository: Repository<PaymentWebhook>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    private readonly aiService: AiService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Get all active subscription plans
   */
  async getSubscriptionPlans(planType?: PlanType): Promise<SubscriptionPlan[]> {
    const where: any = { isActive: true };
    if (planType) {
      where.planType = planType;
    }

    return this.subscriptionPlanRepository.find({
      where,
      order: { planType: 'ASC', price: 'ASC' },
    });
  }

  /**
   * Get subscription plan by ID
   */
  async getSubscriptionPlanById(planId: string): Promise<SubscriptionPlan> {
    const plan = await this.subscriptionPlanRepository.findOne({
      where: { id: planId, isActive: true },
    });

    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }

    return plan;
  }

  /**
   * Create payment order (Razorpay/Stripe)
   * Returns order details for frontend to initiate payment
   */
  async createPaymentOrder(
    userId: string,
    planId: string,
    options: {
      gateway?: PaymentGateway;
      paymentMethodId?: string;
      propertyId?: string; // For featured listing subscriptions
    } = {},
  ): Promise<{
    orderId: string;
    amount: number;
    currency: string;
    gateway: PaymentGateway;
    orderData: Record<string, any>; // Gateway-specific order data
  }> {
    const plan = await this.getSubscriptionPlanById(planId);
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const gateway = options.gateway || PaymentGateway.RAZORPAY; // Default to Razorpay

    // Create payment record
    const payment = this.paymentRepository.create({
      userId,
      amount: plan.price,
      currency: plan.currency,
      gateway,
      status: PaymentStatus.PENDING,
      purpose: this.mapPlanTypeToPurpose(plan.planType),
      relatedEntityType: options.propertyId ? RelatedEntityType.PROPERTY : RelatedEntityType.SUBSCRIPTION,
      relatedEntityId: options.propertyId || plan.id, // Store plan ID or property ID
      paymentMethodId: options.paymentMethodId || null,
      metadata: {
        planId: plan.id,
        planType: plan.planType,
        planName: plan.name,
        propertyId: options.propertyId || null,
      },
    });

    const savedPayment = await this.paymentRepository.save(payment);

    // Create order in payment gateway
    let orderId: string;
    let orderData: Record<string, any>;

    try {
      if (gateway === PaymentGateway.RAZORPAY) {
        // Razorpay Order Creation
        // TODO: Integrate with Razorpay SDK
        // const Razorpay = require('razorpay');
        // const razorpay = new Razorpay({
        //   key_id: process.env.RAZORPAY_KEY_ID,
        //   key_secret: process.env.RAZORPAY_KEY_SECRET,
        // });
        // const razorpayOrder = await razorpay.orders.create({
        //   amount: Math.round(plan.price * 100), // Amount in paise
        //   currency: plan.currency,
        //   receipt: `subscription_${planId}_${Date.now()}`,
        //   notes: {
        //     user_id: userId,
        //     plan_id: planId,
        //     payment_id: savedPayment.id,
        //   },
        // });
        // orderId = razorpayOrder.id;
        // orderData = {
        //   key: process.env.RAZORPAY_KEY_ID,
        //   order_id: razorpayOrder.id,
        //   amount: razorpayOrder.amount,
        //   currency: razorpayOrder.currency,
        //   name: 'Bhoomisetu',
        //   description: plan.displayName,
        //   prefill: {
        //     name: user.fullName || '',
        //     email: user.primaryEmail || '',
        //     contact: user.primaryPhone || '',
        //   },
        // };

        // For now, simulate Razorpay order creation
        orderId = `order_simulated_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        orderData = {
          key: 'rzp_test_simulated_key', // Simulated
          order_id: orderId,
          amount: Math.round(plan.price * 100), // Amount in paise
          currency: plan.currency,
          name: 'Bhoomisetu',
          description: plan.displayName,
          prefill: {
            name: user.fullName || '',
            email: user.primaryEmail || '',
            contact: user.primaryPhone || '',
          },
        };
        this.logger.log(`Razorpay order created (simulated): ${orderId}. Ready for Razorpay SDK integration.`);
      } else if (gateway === PaymentGateway.STRIPE) {
        // Stripe Payment Intent Creation
        // TODO: Integrate with Stripe SDK
        // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        // const paymentIntent = await stripe.paymentIntents.create({
        //   amount: Math.round(plan.price * 100), // Amount in cents
        //   currency: plan.currency.toLowerCase(),
        //   metadata: {
        //     user_id: userId,
        //     plan_id: planId,
        //     payment_id: savedPayment.id,
        //   },
        // });
        // orderId = paymentIntent.id;
        // orderData = {
        //   client_secret: paymentIntent.client_secret,
        //   payment_intent_id: paymentIntent.id,
        //   amount: paymentIntent.amount,
        //   currency: paymentIntent.currency,
        // };

        // For now, simulate Stripe payment intent creation
        orderId = `pi_simulated_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        orderData = {
          client_secret: `pi_simulated_secret_${Date.now()}`,
          payment_intent_id: orderId,
          amount: Math.round(plan.price * 100), // Amount in cents
          currency: plan.currency.toLowerCase(),
        };
        this.logger.log(`Stripe payment intent created (simulated): ${orderId}. Ready for Stripe SDK integration.`);
      } else {
        throw new BadRequestException('Unsupported payment gateway');
      }

      // Update payment with order ID
      savedPayment.gatewayOrderId = orderId;
      await this.paymentRepository.save(savedPayment);

      return {
        orderId,
        amount: plan.price,
        currency: plan.currency,
        gateway,
        orderData,
      };
    } catch (error: any) {
      this.logger.error(`Failed to create payment order: ${error.message}`);
      savedPayment.status = PaymentStatus.FAILED;
      savedPayment.failureReason = error.message;
      savedPayment.failedAt = new Date();
      await this.paymentRepository.save(savedPayment);
      throw new InternalServerErrorException('Failed to create payment order');
    }
  }

  /**
   * Verify and process payment (called after payment completion)
   * This is called via webhook or after frontend confirms payment
   */
  async verifyAndProcessPayment(
    paymentId: string,
    gatewayPaymentId: string,
    gatewaySignature?: string,
    webhookPayload?: Record<string, any>,
  ): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['user', 'paymentMethod'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status === PaymentStatus.COMPLETED) {
      this.logger.warn(`Payment ${paymentId} already processed`);
      return payment;
    }

    try {
      // Verify payment signature with gateway
      const isValidSignature = await this.verifyPaymentSignature(
        payment.gateway,
        payment.gatewayOrderId!,
        gatewayPaymentId,
        gatewaySignature,
        webhookPayload,
      );

      if (!isValidSignature && payment.gateway !== PaymentGateway.RAZORPAY) {
        // For Razorpay, signature verification is critical
        throw new BadRequestException('Invalid payment signature');
      }

      // Perform AI fraud checks BEFORE processing payment
      await this.performPaymentFraudChecks(payment, gatewayPaymentId);

      // Update payment status
      payment.gatewayPaymentId = gatewayPaymentId;
      payment.status = PaymentStatus.COMPLETED;
      payment.completedAt = new Date();
      if (gatewaySignature) {
        payment.signature = gatewaySignature;
      }
      if (webhookPayload) {
        payment.metadata = webhookPayload;
      }
      await this.paymentRepository.save(payment);

      // Process subscription/purchase based on payment purpose
      await this.processPaymentPurpose(payment);

      this.logger.log(`Payment ${paymentId} verified and processed successfully`);

      return payment;
    } catch (error: any) {
      this.logger.error(`Failed to verify payment ${paymentId}: ${error.message}`);
      payment.status = PaymentStatus.FAILED;
      payment.failureReason = error.message;
      payment.failedAt = new Date();
      await this.paymentRepository.save(payment);
      throw error;
    }
  }

  /**
   * Perform AI fraud checks on payment
   * Checks: Fraud detection, Duplicate cards, Location mismatch
   */
  private async performPaymentFraudChecks(payment: Payment, gatewayPaymentId: string): Promise<void> {
    try {
      const user = payment.user;
      const paymentMethod = payment.paymentMethod;

      // Prepare data for AI fraud check
      const fraudCheckData = {
        userId: user.id,
        paymentId: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        gateway: payment.gateway,
        gatewayPaymentId,
        userEmail: user.primaryEmail,
        userPhone: user.primaryPhone,
        userLocation: {
          // User location from profile (if available)
          city: null, // TODO: Add user location fields
          state: null,
          country: 'India',
        },
        billingAddress: paymentMethod
          ? {
              city: paymentMethod.billingCity,
              state: paymentMethod.billingState,
              country: paymentMethod.billingCountry,
              pincode: paymentMethod.billingPincode,
            }
          : null,
        cardLast4: paymentMethod?.cardLast4 || null,
        cardBrand: paymentMethod?.cardBrand || null,
        cardType: paymentMethod?.cardType || null,
        previousPayments: [], // TODO: Get user's previous payments for duplicate detection
      };

      // Call AI fraud detection service
      const aiFraudCheck = await this.aiService.scoreFraudRisk({
        userId: user.id,
        email: user.primaryEmail || undefined,
        phone: user.primaryPhone || undefined,
        ipAddress: undefined, // TODO: Get from request
        deviceId: undefined, // TODO: Get from request
        requestType: 'payment',
        timestamp: new Date().toISOString(),
        metadata: {
          amount: payment.amount,
          currency: payment.currency,
          gateway: payment.gateway,
          purpose: payment.purpose,
        },
      });

      // Update payment with AI check results
      payment.fraudRiskScore = aiFraudCheck.riskScore || 0;
      payment.aiCheckPerformed = true;
      payment.aiCheckResult = {
        riskScore: aiFraudCheck.riskScore,
        riskLevel: aiFraudCheck.riskLevel,
        reasons: aiFraudCheck.reasons || [],
        recommendations: aiFraudCheck.recommendations || [],
        shouldBlock: aiFraudCheck.shouldBlock,
        shouldRequireManualReview: aiFraudCheck.shouldRequireManualReview,
        confidence: aiFraudCheck.confidence,
      };

      // Check for duplicate cards (AI check)
      if (paymentMethod) {
        const duplicateCardCheck = await this.checkDuplicateCard(paymentMethod.cardLast4 || null, user.id);
        payment.duplicateCardDetected = duplicateCardCheck.duplicate;
        paymentMethod.duplicateCardFlagged = duplicateCardCheck.duplicate;

        if (duplicateCardCheck.duplicate) {
          this.logger.warn(`Duplicate card detected for payment ${payment.id}. Card last4: ${paymentMethod.cardLast4}`);
        }

        // Check for location mismatch
        const locationMismatchCheck = this.checkLocationMismatch(
          { city: paymentMethod.billingCity, state: paymentMethod.billingState },
          { city: null, state: null }, // TODO: Get user location
        );
        payment.locationMismatchDetected = locationMismatchCheck.mismatch;
        paymentMethod.locationMismatchFlagged = locationMismatchCheck.mismatch;

        if (locationMismatchCheck.mismatch) {
          this.logger.warn(`Location mismatch detected for payment ${payment.id}`);
        }

        await this.paymentMethodRepository.save(paymentMethod);
      }

      // Block payment if high fraud risk
      if (payment.fraudRiskScore > 70) {
        throw new BadRequestException(
          `Payment blocked due to high fraud risk (score: ${payment.fraudRiskScore}). Please contact customer service.`,
        );
      }

      // Warn but allow if moderate risk
      if (payment.fraudRiskScore > 50) {
        this.logger.warn(`Payment ${payment.id} has moderate fraud risk (score: ${payment.fraudRiskScore}). Proceeding with caution.`);
        // TODO: Notify CS agents about high-risk payment
      }

      await this.paymentRepository.save(payment);
    } catch (error: any) {
      this.logger.error(`AI fraud check failed for payment ${payment.id}: ${error.message}`);
      // If AI check fails, log but don't block payment (graceful degradation)
      payment.aiCheckPerformed = false;
      payment.aiCheckResult = { error: error.message };
      await this.paymentRepository.save(payment);
    }
  }

  /**
   * Check for duplicate card usage across accounts
   */
  private async checkDuplicateCard(cardLast4: string | null, userId: string): Promise<{ duplicate: boolean; details?: any }> {
    if (!cardLast4) {
      return { duplicate: false };
    }

    // Find if same card (last4) is used by other users
    const otherPaymentMethods = await this.paymentMethodRepository.find({
      where: { cardLast4, isActive: true },
    });

    const otherUsers = otherPaymentMethods.filter((pm) => pm.userId !== userId);

    if (otherUsers.length > 0) {
      return {
        duplicate: true,
        details: {
          cardLast4,
          otherUsersCount: otherUsers.length,
          otherUserIds: otherUsers.map((pm) => pm.userId),
        },
      };
    }

    return { duplicate: false };
  }

  /**
   * Check for location mismatch between billing address and user location
   */
  private checkLocationMismatch(
    billingAddress: { city?: string | null; state?: string | null },
    userLocation: { city?: string | null; state?: string | null },
  ): { mismatch: boolean; details?: any } {
    // If user location not available, skip check
    if (!userLocation.city && !userLocation.state) {
      return { mismatch: false };
    }

    // If billing address not available, skip check
    if (!billingAddress.city && !billingAddress.state) {
      return { mismatch: false };
    }

    // Check for mismatch (simplified - can be enhanced with geocoding)
    const cityMismatch = billingAddress.city && userLocation.city && 
                        billingAddress.city.toLowerCase() !== userLocation.city.toLowerCase();
    const stateMismatch = billingAddress.state && userLocation.state && 
                         billingAddress.state.toLowerCase() !== userLocation.state.toLowerCase();

    if (cityMismatch || stateMismatch) {
      return {
        mismatch: true,
        details: {
          billingCity: billingAddress.city,
          billingState: billingAddress.state,
          userCity: userLocation.city,
          userState: userLocation.state,
        },
      };
    }

    return { mismatch: false };
  }

  /**
   * Verify payment signature with gateway
   */
  private async verifyPaymentSignature(
    gateway: PaymentGateway,
    orderId: string,
    paymentId: string,
    signature?: string,
    webhookPayload?: Record<string, any>,
  ): Promise<boolean> {
    if (!signature) {
      // For Stripe, webhook signature verification is different
      if (gateway === PaymentGateway.STRIPE && webhookPayload) {
        // TODO: Verify Stripe webhook signature
        // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        // const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        // const sig = req.headers['stripe-signature'];
        // const event = stripe.webhooks.constructEvent(webhookPayload, sig, webhookSecret);
        // return true;
        return true; // Simulated for now
      }
      return false; // Razorpay requires signature
    }

    if (gateway === PaymentGateway.RAZORPAY) {
      // Razorpay signature verification
      // TODO: Implement Razorpay signature verification
      // const crypto = require('crypto');
      // const secret = process.env.RAZORPAY_KEY_SECRET;
      // const generatedSignature = crypto
      //   .createHmac('sha256', secret)
      //   .update(`${orderId}|${paymentId}`)
      //   .digest('hex');
      // return generatedSignature === signature;
      this.logger.log(`Razorpay signature verification (simulated). Ready for Razorpay SDK integration.`);
      return true; // Simulated for now
    } else if (gateway === PaymentGateway.STRIPE) {
      // Stripe signature verification is done via webhook
      return true; // Simulated for now
    }

    return false;
  }

  /**
   * Process payment purpose (create subscription, apply featured listing, etc.)
   */
  private async processPaymentPurpose(payment: Payment): Promise<void> {
    switch (payment.purpose) {
      case PaymentPurpose.SUBSCRIPTION:
        await this.processSubscriptionPurchase(payment);
        break;
      case PaymentPurpose.FEATURED_LISTING:
        await this.processFeaturedListingPurchase(payment);
        break;
      case PaymentPurpose.PRIORITY_MEDIATION:
        // TODO: Implement priority mediation feature
        this.logger.log(`Priority mediation purchased for payment ${payment.id}`);
        break;
      default:
        this.logger.warn(`Unknown payment purpose: ${payment.purpose}`);
    }
  }

  /**
   * Process subscription purchase
   */
  private async processSubscriptionPurchase(payment: Payment): Promise<void> {
    try {
      // Get plan from payment metadata (stored when creating order)
    let plan: SubscriptionPlan | null = null;
    
    if (payment.metadata?.planId) {
      plan = await this.subscriptionPlanRepository.findOne({
        where: { id: payment.metadata.planId },
      });
    }
    
    // Fallback: Try to get from relatedEntityId (for backward compatibility)
    if (!plan && payment.relatedEntityId) {
      plan = await this.subscriptionPlanRepository.findOne({
        where: { id: payment.relatedEntityId },
      });
    }

    if (!plan) {
      throw new NotFoundException('Subscription plan not found for payment');
    }

      // Create or update subscription
      const mappedSubscriptionType = this.mapPlanTypeToSubscriptionType(plan.planType);
      let subscription = await this.subscriptionRepository.findOne({
        where: {
          userId: payment.userId,
          subscriptionType: mappedSubscriptionType,
          status: SubscriptionStatus.ACTIVE,
        },
      });

      const now = new Date();
      const expiresAt = new Date(now);
      expiresAt.setDate(expiresAt.getDate() + plan.durationDays);

      if (!subscription) {
        // Create new subscription
        subscription = this.subscriptionRepository.create({
          userId: payment.userId,
          subscriptionType: mappedSubscriptionType,
          status: SubscriptionStatus.ACTIVE,
          startsAt: now,
          expiresAt,
          paymentId: payment.id,
          amountPaid: payment.amount,
          subscriptionPlanId: plan.id,
          paymentMethodId: payment.paymentMethodId || undefined,
          autoRenewalEnabled: false, // Default to false, user can enable
          nextBillingDate: plan.billingPeriod !== 'one_time' ? expiresAt : undefined,
        });
      } else {
        // Extend existing subscription
        const currentExpiresAt = subscription.expiresAt > now ? subscription.expiresAt : now;
        const newExpiresAt = new Date(currentExpiresAt);
        newExpiresAt.setDate(newExpiresAt.getDate() + plan.durationDays);
        
        subscription.expiresAt = newExpiresAt;
        subscription.amountPaid = (subscription.amountPaid || 0) + payment.amount;
        subscription.paymentMethodId = payment.paymentMethodId || subscription.paymentMethodId;
        subscription.updatedAt = now;
      }

      subscription = await this.subscriptionRepository.save(subscription);

      // Create subscription transaction
      const transaction = this.subscriptionTransactionRepository.create({
        subscriptionId: subscription.id,
        paymentId: payment.id,
        subscriptionPlanId: plan.id,
        transactionType: subscription.createdAt.getTime() === subscription.updatedAt.getTime() 
          ? TransactionType.INITIAL_PURCHASE 
          : TransactionType.EXTENSION,
        amountPaid: payment.amount,
        currency: payment.currency,
        periodStart: subscription.startsAt,
        periodEnd: subscription.expiresAt,
        status: TransactionStatus.COMPLETED,
        autoRenewalEnabled: subscription.autoRenewalEnabled,
        nextBillingDate: subscription.nextBillingDate,
      });

      await this.subscriptionTransactionRepository.save(transaction);

      // Notify user about subscription activation
      await this.notificationsService
        .sendNotification(
          payment.userId,
          NotificationType.SUBSCRIPTION_RENEWAL,
          'Subscription Activated!',
          `Your ${plan.displayName} subscription is now active. Expires on ${expiresAt.toLocaleDateString()}.`,
          {
            priority: 'high' as any,
            data: {
              subscriptionId: subscription.id,
              planId: plan.id,
              expiresAt: expiresAt.toISOString(),
            },
          },
        )
        .catch((error) => {
          this.logger.error(`Failed to send subscription notification: ${error.message}`);
        });

      this.logger.log(`Subscription created/updated for user ${payment.userId}. Subscription ID: ${subscription.id}`);
    } catch (error: any) {
      this.logger.error(`Failed to process subscription purchase: ${error.message}`);
      throw error;
    }
  }

  /**
   * Process featured listing purchase
   */
  private async processFeaturedListingPurchase(payment: Payment): Promise<void> {
    if (!payment.relatedEntityId) {
      throw new BadRequestException('Property ID required for featured listing purchase');
    }

    const property = await this.propertyRepository.findOne({
      where: { id: payment.relatedEntityId, sellerId: payment.userId },
    });

    if (!property) {
      throw new NotFoundException('Property not found or access denied');
    }

    // Get plan to determine featured duration
    const plan = await this.subscriptionPlanRepository.findOne({
      where: { id: payment.relatedEntityId }, // For featured listing, planId might be in metadata
    });

    const featuredUntil = new Date();
    featuredUntil.setDate(featuredUntil.getDate() + (plan?.durationDays || 30));

    // Update property with featured badge
    property.isFeatured = true;
    property.featuredUntil = featuredUntil;
    await this.propertyRepository.save(property);

    // Create subscription for featured listing (for tracking)
    const subscription = this.subscriptionRepository.create({
      userId: payment.userId,
      subscriptionType: 'featured_listing' as any,
      status: SubscriptionStatus.ACTIVE,
      startsAt: new Date(),
      expiresAt: featuredUntil,
      paymentId: payment.id,
      amountPaid: payment.amount,
      subscriptionPlanId: plan?.id || null,
      metadata: { propertyId: property.id },
    });

    await this.subscriptionRepository.save(subscription);

    this.logger.log(`Featured listing applied to property ${property.id}. Featured until: ${featuredUntil}`);
  }

  /**
   * Map plan type to payment purpose
   */
  private mapPlanTypeToPurpose(planType: PlanType): PaymentPurpose {
    switch (planType) {
      case PlanType.PREMIUM_SELLER:
      case PlanType.PREMIUM_BUYER:
        return PaymentPurpose.SUBSCRIPTION;
      case PlanType.FEATURED_LISTING:
        return PaymentPurpose.FEATURED_LISTING;
      default:
        return PaymentPurpose.SUBSCRIPTION;
    }
  }

  /**
   * Map plan type to subscription type
   */
  private mapPlanTypeToSubscriptionType(planType: PlanType): SubscriptionType {
    switch (planType) {
      case PlanType.PREMIUM_SELLER:
        return SubscriptionType.PREMIUM_SELLER;
      case PlanType.PREMIUM_BUYER:
        return SubscriptionType.PREMIUM_BUYER;
      case PlanType.FEATURED_LISTING:
        return SubscriptionType.FEATURED_LISTING;
      default:
        return SubscriptionType.PREMIUM_SELLER;
    }
  }

  /**
   * Get user payment methods
   */
  async getUserPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    return this.paymentMethodRepository.find({
      where: { userId, isActive: true },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  /**
   * Save payment method from gateway (after successful payment)
   */
  async savePaymentMethod(
    userId: string,
    gateway: PaymentGateway,
    gatewayPaymentMethodId: string,
    cardDetails: {
      last4: string;
      brand: CardBrand;
      type: CardType;
      expiryMonth: number;
      expiryYear: number;
    },
    billingAddress: {
      name?: string;
      email?: string;
      phone?: string;
      addressLine1?: string;
      addressLine2?: string;
      city?: string;
      state?: string;
      country?: string;
      pincode?: string;
    },
  ): Promise<PaymentMethod> {
    // Check if payment method already exists
    const existing = await this.paymentMethodRepository.findOne({
      where: { userId, gatewayPaymentMethodId, isActive: true },
    });

    if (existing) {
      return existing;
    }

    // Set as default if user has no default payment method
    const hasDefault = await this.paymentMethodRepository.findOne({
      where: { userId, isDefault: true, isActive: true },
    });

    // Perform AI checks on payment method
    const duplicateCheck = await this.checkDuplicateCard(cardDetails.last4, userId);
    const locationMismatch = this.checkLocationMismatch(
      { city: billingAddress.city, state: billingAddress.state },
      { city: null, state: null }, // TODO: Get user location
    );

    const paymentMethod = this.paymentMethodRepository.create({
      userId,
      gateway,
      gatewayPaymentMethodId,
      cardLast4: cardDetails.last4,
      cardBrand: cardDetails.brand,
      cardType: cardDetails.type,
      cardExpiryMonth: cardDetails.expiryMonth,
      cardExpiryYear: cardDetails.expiryYear,
      billingName: billingAddress.name || null,
      billingEmail: billingAddress.email || null,
      billingPhone: billingAddress.phone || null,
      billingAddressLine1: billingAddress.addressLine1 || null,
      billingAddressLine2: billingAddress.addressLine2 || null,
      billingCity: billingAddress.city || null,
      billingState: billingAddress.state || null,
      billingCountry: billingAddress.country || 'India',
      billingPincode: billingAddress.pincode || null,
      isDefault: !hasDefault,
      duplicateCardFlagged: duplicateCheck.duplicate,
      locationMismatchFlagged: locationMismatch.mismatch,
      metadata: {
        duplicateCheck: duplicateCheck.details,
        locationMismatch: locationMismatch.details,
      },
    });

    return await this.paymentMethodRepository.save(paymentMethod);
  }

  /**
   * Get user payments
   */
  async getUserPayments(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ payments: Payment[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;

    const [payments, total] = await this.paymentRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
      relations: ['paymentMethod'],
    });

    return { payments, total, page, limit };
  }

  /**
   * Process payment webhook (from Razorpay/Stripe)
   */
  async processWebhook(
    gateway: PaymentGateway,
    eventType: string,
    eventId: string,
    payload: Record<string, any>,
    signature?: string,
  ): Promise<void> {
    // Store webhook event
    const webhook = this.paymentWebhookRepository.create({
      gateway,
      eventType,
      eventId,
      payload,
      signature: signature || null,
      gatewayOrderId: payload.order_id || payload.id || null,
      gatewayPaymentId: payload.payment_id || payload.payment_intent?.id || null,
    });

    await this.paymentWebhookRepository.save(webhook);

    try {
      // Find payment by gateway order/payment ID
      const gatewayOrderId = payload.order_id || payload.id;
      const gatewayPaymentId = payload.payment_id || payload.payment_intent?.id;

      if (!gatewayOrderId && !gatewayPaymentId) {
        this.logger.warn(`Webhook event ${eventId} has no order/payment ID`);
        return;
      }

      let payment: Payment | null = null;
      
      if (gatewayOrderId) {
        payment = await this.paymentRepository.findOne({
          where: { gatewayOrderId },
        });
      }
      
      if (!payment && gatewayPaymentId) {
        payment = await this.paymentRepository.findOne({
          where: { gatewayPaymentId },
        });
      }

      if (!payment) {
        this.logger.warn(`Payment not found for webhook event ${eventId}`);
        return;
      }

      // Update webhook with payment ID
      webhook.paymentId = payment.id;
      await this.paymentWebhookRepository.save(webhook);

      // Process webhook event
      if (eventType.includes('payment.captured') || eventType.includes('payment_intent.succeeded')) {
        // Payment successful
        if (payment.status !== PaymentStatus.COMPLETED) {
          await this.verifyAndProcessPayment(payment.id, gatewayPaymentId || '', signature, payload);
        }
      } else if (eventType.includes('payment.failed') || eventType.includes('payment_intent.payment_failed')) {
        // Payment failed
        payment.status = PaymentStatus.FAILED;
        payment.failureReason = payload.error?.message || 'Payment failed';
        payment.failedAt = new Date();
        await this.paymentRepository.save(payment);
      } else if (eventType.includes('refund')) {
        // Payment refunded
        payment.status = PaymentStatus.REFUNDED;
        payment.refundedAt = new Date();
        await this.paymentRepository.save(payment);
      }

      // Mark webhook as processed
      webhook.processed = true;
      webhook.processedAt = new Date();
      await this.paymentWebhookRepository.save(webhook);

      this.logger.log(`Webhook event ${eventId} processed successfully for payment ${payment.id}`);
    } catch (error: any) {
      this.logger.error(`Failed to process webhook ${eventId}: ${error.message}`);
      webhook.processingError = error.message;
      webhook.retryCount += 1;
      await this.paymentWebhookRepository.save(webhook);
      throw error;
    }
  }

  /**
   * Refund payment
   */
  async refundPayment(paymentId: string, amount?: number, reason?: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('Only completed payments can be refunded');
    }

    try {
      // TODO: Process refund with gateway
      // if (payment.gateway === PaymentGateway.RAZORPAY) {
      //   const Razorpay = require('razorpay');
      //   const razorpay = new Razorpay({
      //     key_id: process.env.RAZORPAY_KEY_ID,
      //     key_secret: process.env.RAZORPAY_KEY_SECRET,
      //   });
      //   const refund = await razorpay.payments.refund(payment.gatewayPaymentId!, {
      //     amount: amount ? Math.round(amount * 100) : undefined, // Amount in paise
      //     notes: { reason: reason || 'Refund requested' },
      //   });
      // }
      // else if (payment.gateway === PaymentGateway.STRIPE) {
      //   const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      //   const refund = await stripe.refunds.create({
      //     payment_intent: payment.gatewayPaymentId!,
      //     amount: amount ? Math.round(amount * 100) : undefined, // Amount in cents
      //     reason: reason || 'requested_by_customer',
      //   });
      // }

      // For now, simulate refund
      this.logger.log(`Refund processed (simulated) for payment ${paymentId}. Ready for gateway SDK integration.`);

      payment.status = PaymentStatus.REFUNDED;
      payment.refundedAt = new Date();
      if (reason) {
        payment.failureReason = `Refund: ${reason}`;
      }
      await this.paymentRepository.save(payment);

      return payment;
    } catch (error: any) {
      this.logger.error(`Failed to refund payment ${paymentId}: ${error.message}`);
      throw new InternalServerErrorException('Failed to process refund');
    }
  }
}
