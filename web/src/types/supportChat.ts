export type SupportChatRole = 'customer_service' | 'buyer' | 'seller' | 'agent';

export interface SupportChatSession {
  id: string;
  userId: string;
  supportRole: SupportChatRole;
  status: 'open' | 'closed';
  assignedAgentId?: string | null;
  typingByUserId?: string | null;
  typingAt?: string | null;
  lastMessageAt?: string | null;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SupportChatAdminSession {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string | null;
  supportRole: SupportChatRole;
  status: 'open' | 'closed';
  assignedAgentId?: string | null;
  assignedAgentName?: string | null;
  lastMessageAt?: string | null;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SupportChatMessage {
  id: string;
  sessionId: string;
  senderId: string;
  senderRole: 'user' | 'support';
  senderName: string;
  messageType: 'text';
  content: string;
  isDeleted: boolean;
  isEdited: boolean;
  editedAt?: string | null;
  deliveredAt?: string | null;
  readAt?: string | null;
  createdAt: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
}
