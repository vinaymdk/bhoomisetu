import apiClient from '../config/api';
import type { SupportChatAccessMapping, SupportChatAccessUser, SupportChatAdminSession, SupportChatRole } from '../types/supportChat';

export const supportChatAdminService = {
  async listSessions(filters?: { status?: string; supportRole?: string; search?: string }) {
    const response = await apiClient.get('/support-chat/admin/sessions', { params: filters });
    return response.data as SupportChatAdminSession[];
  },
  async listAccessMappings(): Promise<SupportChatAccessMapping[]> {
    const response = await apiClient.get('/support-chat/access');
    return response.data;
  },
  async listEligibleUsers(params?: { search?: string; supportRole?: SupportChatRole }): Promise<SupportChatAccessUser[]> {
    const response = await apiClient.get('/support-chat/eligible-users', { params });
    return response.data;
  },
  async setAccessMapping(payload: { userId: string; supportRole: SupportChatRole; isEnabled: boolean }) {
    const response = await apiClient.post('/support-chat/access', payload);
    return response.data as SupportChatAccessMapping;
  },
};
