import apiClient from '../config/api';
import type {
  CreatePaymentOrderRequest,
  PaymentOrderResponse,
  PaymentsListResponse,
  PaymentMethod,
  Payment,
  VerifyPaymentRequest,
} from '../types/payments';
import type { SubscriptionPlan, SubscriptionType } from '../types/subscriptions';

export const paymentsService = {
  async getPlans(planType?: SubscriptionType): Promise<SubscriptionPlan[]> {
    const response = await apiClient.get('/payments/plans', {
      params: planType ? { planType } : undefined,
    });
    return response.data;
  },

  async getPlanById(planId: string): Promise<SubscriptionPlan> {
    const response = await apiClient.get(`/payments/plans/${planId}`);
    return response.data;
  },

  async createPaymentOrder(payload: CreatePaymentOrderRequest): Promise<PaymentOrderResponse> {
    const response = await apiClient.post('/payments/orders', payload);
    return response.data;
  },

  async verifyPayment(payload: VerifyPaymentRequest): Promise<Payment> {
    const response = await apiClient.post('/payments/verify', payload);
    return response.data;
  },

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const response = await apiClient.get('/payments/methods');
    return response.data;
  },

  async getPayments(page: number = 1, limit: number = 20): Promise<PaymentsListResponse> {
    const response = await apiClient.get('/payments', { params: { page, limit } });
    return response.data;
  },

  async getPaymentById(paymentId: string): Promise<Payment> {
    const response = await apiClient.get(`/payments/${paymentId}`);
    return response.data;
  },
};
