export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';
export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'read';
export type NotificationType =
  | 'property_match'
  | 'price_drop'
  | 'viewing_reminder'
  | 'subscription_renewal'
  | 'cs_followup'
  | 'interest_expression'
  | 'mediation_update'
  | 'ai_chat_escalation'
  | 'action_alert'
  | 'general';

export interface NotificationItem {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  messageEnglish?: string | null;
  messageTelugu?: string | null;
  data?: Record<string, any> | null;
  priority: NotificationPriority;
  status: NotificationStatus;
  readAt?: string | null;
  createdAt: string;
}

export interface NotificationListResponse {
  notifications: NotificationItem[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
}

export interface NotificationPreferences {
  pushEnabled: boolean;
  smsEnabled: boolean;
  emailEnabled: boolean;
  propertyMatchEnabled: boolean;
  priceDropEnabled: boolean;
  viewingReminderEnabled: boolean;
  subscriptionRenewalEnabled: boolean;
  csFollowupEnabled: boolean;
  interestExpressionEnabled: boolean;
  mediationUpdateEnabled: boolean;
  aiChatEscalationEnabled: boolean;
  quietHoursStart?: string | null;
  quietHoursEnd?: string | null;
  phoneNumber?: string | null;
  emailAddress?: string | null;
}
