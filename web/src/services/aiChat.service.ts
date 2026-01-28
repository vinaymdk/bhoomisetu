import { apiClient } from '../config/api';

export type ChatLanguage = 'en' | 'te' | 'hi';

export interface ChatMessageResponse {
  conversationId: string;
  messageId: string;
  content: string;
  requiresEscalation: boolean;
  propertySuggestions?: Array<{
    propertyId: string;
    title: string;
    price: number;
    location: string;
    matchScore: number;
    matchReasons: string[];
  }>;
}

export const aiChatService = {
  async sendMessage(message: string, language: ChatLanguage, conversationId?: string) {
    const response = await apiClient.post('/ai-chat/message', {
      message,
      language,
      conversationId,
    });
    return response.data as ChatMessageResponse;
  },
};
