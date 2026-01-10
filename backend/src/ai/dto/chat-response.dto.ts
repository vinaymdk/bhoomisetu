import { ChatLanguage, ChatContextType } from './chat-request.dto';

export enum MessageType {
  TEXT = 'text',
  SUGGESTION = 'suggestion',
  ACTION = 'action',
  SYSTEM = 'system',
}

export enum DetectedIntent {
  FAQ = 'faq',
  PROPERTY_SEARCH = 'property_search',
  SERIOUS_INTENT = 'serious_intent',
  APPOINTMENT = 'appointment',
  REQUIREMENT_UPDATE = 'requirement_update',
  COMPLAINT = 'complaint',
  GENERAL = 'general',
}

export interface PropertySuggestion {
  propertyId: string;
  title: string;
  price: number;
  location: string;
  matchScore: number;
  matchReasons: string[];
}

export interface ActionSuggestion {
  actionType: 'view_property' | 'update_requirement' | 'book_appointment' | 'escalate_to_cs';
  actionData: Record<string, any>;
  description: string;
}

export class ChatResponseDto {
  conversationId: string;
  messageId: string;
  
  // Response Content
  content: string; // In user's requested language
  contentEnglish?: string; // English translation (if original was Telugu)
  contentTelugu?: string; // Telugu translation (if original was English)
  messageType: MessageType;

  // AI Details
  aiModelVersion?: string;
  aiConfidence?: number;
  detectedIntent?: DetectedIntent;

  // Suggestions & Actions
  propertySuggestions?: PropertySuggestion[];
  actionSuggestions?: ActionSuggestion[];

  // Escalation
  requiresEscalation: boolean;
  escalationReason?: string;

  // Metadata
  metadata?: Record<string, any>;

  createdAt: Date;
}
