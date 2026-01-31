import apiClient from '../config/api';
import type { NotificationListResponse, NotificationPreferences } from '../types/notification';

export const notificationsService = {
  async list(params?: { page?: number; limit?: number; unreadOnly?: boolean }): Promise<NotificationListResponse> {
    const response = await apiClient.get('/notifications', {
      params: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 20,
        unreadOnly: params?.unreadOnly ?? false,
      },
    });
    return response.data;
  },

  async markRead(id: string): Promise<void> {
    await apiClient.put(`/notifications/${id}/read`);
  },

  async markAllRead(): Promise<number> {
    const response = await apiClient.put('/notifications/read-all');
    return response.data;
  },

  async deleteOne(id: string): Promise<void> {
    await apiClient.delete(`/notifications/${id}`);
  },

  async deleteMany(ids: string[]): Promise<number> {
    const response = await apiClient.post('/notifications/bulk-delete', { ids });
    return response.data;
  },

  async deleteAll(): Promise<number> {
    const response = await apiClient.delete('/notifications');
    return response.data;
  },

  async getPreferences(): Promise<NotificationPreferences> {
    const response = await apiClient.get('/notifications/preferences');
    return response.data;
  },

  async updatePreferences(updates: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const response = await apiClient.put('/notifications/preferences', updates);
    return response.data;
  },
};
