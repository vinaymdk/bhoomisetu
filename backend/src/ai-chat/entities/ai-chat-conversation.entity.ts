import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Property } from '../../properties/entities/property.entity';
import { BuyerRequirement } from '../../buyer-requirements/entities/buyer-requirement.entity';
import { AiChatMessage } from './ai-chat-message.entity';
import { AiChatAction } from './ai-chat-action.entity';

export enum ChatLanguage {
  EN = 'en',
  TE = 'te', // Telugu
  HI = 'hi', // Hindi
}

export enum ConversationStatus {
  ACTIVE = 'active',
  ESCALATED = 'escalated',
  COMPLETED = 'completed',
  CLOSED = 'closed',
}

export enum ChatContextType {
  FAQ = 'faq',
  PROPERTY_SEARCH = 'property_search',
  REQUIREMENT_UPDATE = 'requirement_update',
  APPOINTMENT_BOOKING = 'appointment_booking',
  GENERAL = 'general',
}

export enum UserIntent {
  INFORMATION = 'information',
  PROPERTY_SEARCH = 'property_search',
  SERIOUS_INTENT = 'serious_intent',
  COMPLAINT = 'complaint',
  APPOINTMENT = 'appointment',
  REQUIREMENT_UPDATE = 'requirement_update',
}

@Entity('ai_chat_conversations')
@Index(['userId'])
@Index(['sessionId'])
@Index(['status'])
@Index(['escalatedToCs'])
@Index(['createdAt'])
export class AiChatConversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'session_id', type: 'varchar', length: 255, nullable: true })
  sessionId?: string | null;

  @Column({
    type: 'varchar',
    length: 10,
    default: ChatLanguage.EN,
  })
  language: ChatLanguage;

  @Column({
    type: 'varchar',
    length: 50,
    default: ConversationStatus.ACTIVE,
  })
  status: ConversationStatus;

  @Column({ name: 'escalated_to_cs', type: 'boolean', default: false })
  escalatedToCs: boolean; // CRITICAL: Escalated when serious intent detected

  @Column({ name: 'cs_agent_id', type: 'uuid', nullable: true })
  csAgentId?: string | null;

  @Column({ name: 'context_type', type: 'varchar', length: 50, nullable: true })
  contextType?: ChatContextType | null;

  @Column({ name: 'context_property_id', type: 'uuid', nullable: true })
  contextPropertyId?: string | null;

  @Column({ name: 'context_requirement_id', type: 'uuid', nullable: true })
  contextRequirementId?: string | null;

  @Column({ name: 'conversation_summary', type: 'text', nullable: true })
  conversationSummary?: string | null;

  @Column({ name: 'user_intent', type: 'varchar', length: 50, nullable: true })
  userIntent?: UserIntent | null;

  @Column({ name: 'intent_confidence', type: 'decimal', precision: 5, scale: 2, nullable: true })
  intentConfidence?: number | null;

  @Column({ name: 'escalated_at', type: 'timestamptz', nullable: true })
  escalatedAt?: Date | null;

  @Column({ name: 'escalation_reason', type: 'text', nullable: true })
  escalationReason?: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @Column({ name: 'closed_at', type: 'timestamptz', nullable: true })
  closedAt?: Date | null;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'cs_agent_id' })
  csAgent?: User | null;

  @ManyToOne(() => Property, { nullable: true })
  @JoinColumn({ name: 'context_property_id' })
  contextProperty?: Property | null;

  @ManyToOne(() => BuyerRequirement, { nullable: true })
  @JoinColumn({ name: 'context_requirement_id' })
  contextRequirement?: BuyerRequirement | null;

  @OneToMany(() => AiChatMessage, (message) => message.conversation)
  messages: AiChatMessage[];

  @OneToMany(() => AiChatAction, (action) => action.conversation)
  actions: AiChatAction[];
}
