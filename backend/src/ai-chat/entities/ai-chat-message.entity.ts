import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { AiChatConversation } from './ai-chat-conversation.entity';
import { User } from '../../users/entities/user.entity';

export enum SenderType {
  USER = 'user',
  AI = 'ai',
  CUSTOMER_SERVICE = 'customer_service',
}

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

@Entity('ai_chat_messages')
@Index(['conversationId'])
@Index(['senderType'])
@Index(['createdAt'])
@Index(['requiresEscalation'])
export class AiChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'conversation_id', type: 'uuid' })
  conversationId: string;

  @Column({ name: 'sender_type', type: 'varchar', length: 50 })
  senderType: SenderType;

  @Column({ name: 'sender_id', type: 'uuid', nullable: true })
  senderId?: string | null;

  @Column({
    name: 'message_type',
    type: 'varchar',
    length: 50,
    default: MessageType.TEXT,
  })
  messageType: MessageType;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'content_english', type: 'text', nullable: true })
  contentEnglish?: string | null;

  @Column({ name: 'content_telugu', type: 'text', nullable: true })
  contentTelugu?: string | null;

  @Column({ name: 'ai_model_version', type: 'varchar', length: 50, nullable: true })
  aiModelVersion?: string | null;

  @Column({ name: 'ai_reasoning', type: 'text', nullable: true })
  aiReasoning?: string | null;

  @Column({ name: 'ai_confidence', type: 'decimal', precision: 5, scale: 2, nullable: true })
  aiConfidence?: number | null;

  @Column({ name: 'detected_intent', type: 'varchar', length: 50, nullable: true })
  detectedIntent?: DetectedIntent | null;

  @Column({ name: 'suggested_actions', type: 'jsonb', nullable: true })
  suggestedActions?: Record<string, any> | null;

  @Column({ name: 'requires_escalation', type: 'boolean', default: false })
  requiresEscalation: boolean; // CRITICAL: AI flags serious intent

  @Column({ name: 'escalation_reason', type: 'text', nullable: true })
  escalationReason?: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => AiChatConversation, (conversation) => conversation.messages)
  @JoinColumn({ name: 'conversation_id' })
  conversation: AiChatConversation;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'sender_id' })
  sender?: User | null;
}
