import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { AiChatConversation } from './ai-chat-conversation.entity';
import { AiChatMessage } from './ai-chat-message.entity';

export enum ActionType {
  PROPERTY_SUGGESTED = 'property_suggested',
  REQUIREMENT_UPDATED = 'requirement_updated',
  APPOINTMENT_BOOKED = 'appointment_booked',
  ESCALATED_TO_CS = 'escalated_to_cs',
}

export enum ActionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

@Entity('ai_chat_actions')
@Index(['conversationId'])
@Index(['actionType'])
@Index(['status'])
export class AiChatAction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'conversation_id', type: 'uuid' })
  conversationId: string;

  @Column({ name: 'message_id', type: 'uuid', nullable: true })
  messageId?: string | null;

  @Column({ name: 'action_type', type: 'varchar', length: 50 })
  actionType: ActionType;

  @Column({ name: 'action_data', type: 'jsonb' })
  actionData: Record<string, any>;

  @Column({
    type: 'varchar',
    length: 50,
    default: ActionStatus.PENDING,
  })
  status: ActionStatus;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt?: Date | null;

  @Column({ name: 'user_acknowledged', type: 'boolean', default: false })
  userAcknowledged: boolean;

  @Column({ name: 'user_feedback', type: 'varchar', length: 50, nullable: true })
  userFeedback?: 'helpful' | 'not_helpful' | 'escalate' | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => AiChatConversation, (conversation) => conversation.actions)
  @JoinColumn({ name: 'conversation_id' })
  conversation: AiChatConversation;

  @ManyToOne(() => AiChatMessage, { nullable: true })
  @JoinColumn({ name: 'message_id' })
  message?: AiChatMessage | null;
}
