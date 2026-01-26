import apiClient from '../config/api';
import type { SupportChatMessage, SupportChatRole, SupportChatSession } from '../types/supportChat';

export const supportChatService = {
  async listSessions(): Promise<SupportChatSession[]> {
    const response = await apiClient.get('/support-chat/sessions');
    return response.data;
  },
  async getOrCreateSession(supportRole: SupportChatRole): Promise<SupportChatSession> {
    const response = await apiClient.post('/support-chat/sessions', { supportRole });
    return response.data;
  },
  async listMessages(sessionId: string, limit: number = 50, before?: string): Promise<SupportChatMessage[]> {
    const response = await apiClient.get(`/support-chat/sessions/${sessionId}/messages`, {
      params: { limit, before },
    });
    return response.data;
  },
  async sendMessage(sessionId: string, content: string): Promise<SupportChatMessage> {
    const response = await apiClient.post(`/support-chat/sessions/${sessionId}/messages`, {
      content,
      messageType: 'text',
    });
    return response.data;
  },
  async editMessage(messageId: string, content: string): Promise<SupportChatMessage> {
    const response = await apiClient.post(`/support-chat/messages/${messageId}/edit`, { content });
    return response.data;
  },
  async deleteMessage(messageId: string): Promise<SupportChatMessage> {
    const response = await apiClient.post(`/support-chat/messages/${messageId}/delete`);
    return response.data;
  },
  async setTyping(sessionId: string, isTyping: boolean): Promise<void> {
    await apiClient.post(`/support-chat/sessions/${sessionId}/typing`, { isTyping });
  },
  async getTyping(sessionId: string): Promise<{ typingByUserId?: string | null; typingAt?: string | null }> {
    const response = await apiClient.get(`/support-chat/sessions/${sessionId}/typing`);
    return response.data;
  },
};
