import { apiClient } from '../config/api';
import type {
  AdminDashboardStats,
  AdminUserListResponse,
  AdminPendingPropertiesResponse,
  AdminPaymentReportResponse,
  AdminAiMetricsResponse,
  AdminFlaggedReviewsResponse,
  AdminReviewReportsResponse,
  AdminCsLogsResponse,
} from '../types/admin';

export const adminService = {
  async getDashboardStats(): Promise<AdminDashboardStats> {
    const response = await apiClient.get('/admin/dashboard/stats');
    return response.data;
  },

  async listUsers(params: Record<string, any>): Promise<AdminUserListResponse> {
    const response = await apiClient.get('/admin/users', { params });
    return response.data;
  },

  async updateUser(userId: string, payload: Record<string, any>) {
    const response = await apiClient.patch(`/admin/users/${userId}`, payload);
    return response.data;
  },

  async suspendUser(userId: string, reason?: string) {
    const response = await apiClient.post(`/admin/users/${userId}/suspend`, { reason });
    return response.data;
  },

  async activateUser(userId: string) {
    const response = await apiClient.post(`/admin/users/${userId}/activate`);
    return response.data;
  },

  async deleteUser(userId: string) {
    await apiClient.delete(`/admin/users/${userId}`);
  },

  async listPendingProperties(page = 1, limit = 20): Promise<AdminPendingPropertiesResponse> {
    const response = await apiClient.get('/admin/properties/pending', { params: { page, limit } });
    return response.data;
  },

  async approveProperty(propertyId: string, notes?: string) {
    const response = await apiClient.post(`/admin/properties/${propertyId}/approve`, { notes });
    return response.data;
  },

  async rejectProperty(propertyId: string, reason: string) {
    const response = await apiClient.post(`/admin/properties/${propertyId}/reject`, { reason });
    return response.data;
  },

  async getPaymentReports(params: Record<string, any>): Promise<AdminPaymentReportResponse> {
    const response = await apiClient.get('/admin/payments/reports', { params });
    return response.data;
  },

  async getAiMetrics(params: Record<string, any>): Promise<AdminAiMetricsResponse> {
    const response = await apiClient.get('/admin/ai/metrics', { params });
    return response.data;
  },

  async getCsActivityLogs(params: Record<string, any>): Promise<AdminCsLogsResponse> {
    const response = await apiClient.get('/admin/cs/activity-logs', { params });
    return response.data;
  },

  async getCsVerificationLogs(params: Record<string, any>): Promise<AdminCsLogsResponse> {
    const response = await apiClient.get('/admin/cs/verification-logs', { params });
    return response.data;
  },

  async getFlaggedReviews(params: Record<string, any>): Promise<AdminFlaggedReviewsResponse> {
    const response = await apiClient.get('/admin/reviews/flagged', { params });
    return response.data;
  },

  async approveReview(reviewId: string, notes?: string) {
    const response = await apiClient.post(`/admin/reviews/${reviewId}/approve`, { notes });
    return response.data;
  },

  async rejectReview(reviewId: string, reason: string) {
    const response = await apiClient.post(`/admin/reviews/${reviewId}/reject`, { reason });
    return response.data;
  },

  async hideReview(reviewId: string, reason: string) {
    const response = await apiClient.post(`/admin/reviews/${reviewId}/hide`, { reason });
    return response.data;
  },

  async getReviewReports(params: Record<string, any>): Promise<AdminReviewReportsResponse> {
    const response = await apiClient.get('/admin/reviews/reports', { params });
    return response.data;
  },
};
