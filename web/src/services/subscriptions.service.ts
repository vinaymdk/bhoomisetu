import apiClient from '../config/api';
import type {
  PremiumFeaturesResponse,
  Subscription,
  SubscriptionStatusSummary,
} from '../types/subscriptions';

export const subscriptionsService = {
  async getStatus(): Promise<SubscriptionStatusSummary> {
    const response = await apiClient.get('/subscriptions/status');
    return response.data;
  },

  async getFeatures(): Promise<PremiumFeaturesResponse> {
    const response = await apiClient.get('/subscriptions/features');
    return response.data;
  },

  async getUserSubscriptions(): Promise<Subscription[]> {
    const response = await apiClient.get('/subscriptions');
    return response.data;
  },

  async cancelSubscription(id: string, reason?: string): Promise<Subscription> {
    const response = await apiClient.put(`/subscriptions/${id}/cancel`, { reason });
    return response.data;
  },

  async updateAutoRenewal(id: string, enabled: boolean): Promise<Subscription> {
    const response = await apiClient.put(`/subscriptions/${id}/auto-renewal`, { enabled });
    return response.data;
  },
};
