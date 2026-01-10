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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';
import { CreatePaymentOrderDto, VerifyPaymentDto } from './dto/create-payment-order.dto';
import { Public } from '../auth/decorators/public.decorator';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * Get all active subscription plans
   * GET /api/payments/plans
   */
  @Get('plans')
  @Public() // Public endpoint so users can view plans before login
  getSubscriptionPlans(@Query('planType') planType?: string) {
    return this.paymentsService.getSubscriptionPlans(planType as any);
  }

  /**
   * Get subscription plan by ID
   * GET /api/payments/plans/:id
   */
  @Get('plans/:id')
  @Public()
  getSubscriptionPlanById(@Param('id', ParseUUIDPipe) id: string) {
    return this.paymentsService.getSubscriptionPlanById(id);
  }

  /**
   * Create payment order (Razorpay/Stripe)
   * POST /api/payments/orders
   * Returns order details for frontend to initiate payment
   */
  @Post('orders')
  @HttpCode(HttpStatus.CREATED)
  createPaymentOrder(
    @CurrentUser() currentUser: CurrentUserData,
    @Body() createDto: CreatePaymentOrderDto,
  ) {
    return this.paymentsService.createPaymentOrder(currentUser.userId, createDto.planId, {
      gateway: createDto.gateway,
      paymentMethodId: createDto.paymentMethodId,
      propertyId: createDto.propertyId,
    });
  }

  /**
   * Verify and process payment (called after payment completion)
   * POST /api/payments/verify
   */
  @Post('verify')
  verifyPayment(@Body() verifyDto: VerifyPaymentDto) {
    return this.paymentsService.verifyAndProcessPayment(
      verifyDto.paymentId,
      verifyDto.gatewayPaymentId,
      verifyDto.gatewaySignature,
      verifyDto.webhookPayload,
    );
  }

  /**
   * Process payment webhook (from Razorpay/Stripe)
   * POST /api/payments/webhooks/:gateway
   */
  @Post('webhooks/:gateway')
  @Public() // Public endpoint for webhooks (authenticated via signature)
  @HttpCode(HttpStatus.OK)
  processWebhook(
    @Param('gateway') gateway: string,
    @Body() payload: Record<string, any>,
    @Query('event_type') eventType?: string,
    @Query('event_id') eventId?: string,
  ) {
    // Extract webhook signature from headers (implementation depends on gateway)
    const signature = payload.signature || null;
    const extractedEventType = eventType || payload.event || payload.type || 'unknown';
    const extractedEventId = eventId || payload.id || payload.event_id || `event_${Date.now()}`;

    return this.paymentsService.processWebhook(
      gateway as any,
      extractedEventType,
      extractedEventId,
      payload,
      signature,
    );
  }

  /**
   * Get user payment methods
   * GET /api/payments/methods
   */
  @Get('methods')
  getUserPaymentMethods(@CurrentUser() currentUser: CurrentUserData) {
    return this.paymentsService.getUserPaymentMethods(currentUser.userId);
  }

  /**
   * Get user payments
   * GET /api/payments
   */
  @Get()
  getUserPayments(
    @CurrentUser() currentUser: CurrentUserData,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.paymentsService.getUserPayments(
      currentUser.userId,
      page ? parseInt(page.toString(), 10) : 1,
      limit ? parseInt(limit.toString(), 10) : 20,
    );
  }

  /**
   * Get payment by ID
   * GET /api/payments/:id
   */
  @Get(':id')
  getPaymentById(
    @CurrentUser() currentUser: CurrentUserData,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    // TODO: Implement getPaymentById in service
    // For now, get from user payments list
    return this.paymentsService.getUserPayments(currentUser.userId, 1, 100).then((result) => {
      const payment = result.payments.find((p) => p.id === id);
      if (!payment || payment.userId !== currentUser.userId) {
        throw new Error('Payment not found');
      }
      return payment;
    });
  }

  /**
   * Refund payment (admin/CS only)
   * POST /api/payments/:id/refund
   */
  @Post(':id/refund')
  @UseGuards(RolesGuard)
  @Roles('admin', 'customer_service')
  refundPayment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { amount?: number; reason?: string },
  ) {
    return this.paymentsService.refundPayment(id, body.amount, body.reason);
  }
}
