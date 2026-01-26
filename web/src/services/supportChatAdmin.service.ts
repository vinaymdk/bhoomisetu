import apiClient from '../config/api';
import type { SupportChatAdminSession } from '../types/supportChat';

export const supportChatAdminService = {
  async listSessions(filters?: { status?: string; supportRole?: string; search?: string }) {
    const response = await apiClient.get('/support-chat/admin/sessions', { params: filters });
    return response.data as SupportChatAdminSession[];
  },
};
