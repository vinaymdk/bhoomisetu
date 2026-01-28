export type PaymentGateway = 'razorpay' | 'stripe';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';
export type PaymentPurpose = 'subscription' | 'featured_listing' | 'priority_mediation' | 'one_time_feature';

export interface PaymentMethod {
  id: string;
  userId: string;
  gateway: PaymentGateway;
  gatewayPaymentMethodId: string;
  cardLast4?: string | null;
  cardBrand?: string | null;
  cardType?: string | null;
  cardExpiryMonth?: number | null;
  cardExpiryYear?: number | null;
  billingName?: string | null;
  billingEmail?: string | null;
  billingPhone?: string | null;
  billingAddressLine1?: string | null;
  billingAddressLine2?: string | null;
  billingCity?: string | null;
  billingState?: string | null;
  billingCountry?: string | null;
  billingPincode?: string | null;
  isDefault: boolean;
  isActive: boolean;
  fraudRiskScore: number;
  duplicateCardFlagged: boolean;
  locationMismatchFlagged: boolean;
  metadata?: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  gateway: PaymentGateway;
  gatewayOrderId?: string | null;
  gatewayPaymentId?: string | null;
  signature?: string | null;
  paymentMethodId?: string | null;
  status: PaymentStatus;
  purpose: PaymentPurpose;
  relatedEntityType?: string | null;
  relatedEntityId?: string | null;
  fraudRiskScore: number;
  duplicateCardDetected: boolean;
  locationMismatchDetected: boolean;
  aiCheckPerformed: boolean;
  aiCheckResult?: Record<string, any> | null;
  metadata?: Record<string, any> | null;
  failureReason?: string | null;
  initiatedAt?: string | null;
  completedAt?: string | null;
  failedAt?: string | null;
  refundedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  paymentMethod?: PaymentMethod | null;
}

export interface CreatePaymentOrderRequest {
  planId: string;
  gateway?: PaymentGateway;
  paymentMethodId?: string;
  propertyId?: string;
}

export interface PaymentOrderResponse {
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  gateway: PaymentGateway;
  orderData: Record<string, any>;
}

export interface VerifyPaymentRequest {
  paymentId: string;
  gatewayPaymentId: string;
  gatewaySignature?: string;
  webhookPayload?: Record<string, any>;
}

export interface PaymentsListResponse {
  payments: Payment[];
  total: number;
  page: number;
  limit: number;
}
