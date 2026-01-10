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
import { InterestExpression } from './interest-expression.entity';
import { User } from '../../users/entities/user.entity';
import { ChatMessage } from './chat-message.entity';

export enum ChatSessionStatus {
  ACTIVE = 'active',
  ENDED = 'ended',
  PAUSED = 'paused',
  ESCALATED = 'escalated',
}

@Entity('chat_sessions')
@Index(['interestExpressionId'])
@Index(['buyerId'])
@Index(['sellerId'])
@Index(['csAgentId'])
@Index(['status'])
@Index(['lastMessageAt'])
export class ChatSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'interest_expression_id', type: 'uuid' })
  interestExpressionId: string;

  // Participants (CRITICAL: CS is always part of the session)
  @Column({ name: 'buyer_id', type: 'uuid' })
  buyerId: string;

  @Column({ name: 'seller_id', type: 'uuid' })
  sellerId: string;

  @Column({ name: 'cs_agent_id', type: 'uuid' })
  csAgentId: string; // CRITICAL: CS mediates all conversations

  // Session Status
  @Column({
    type: 'varchar',
    length: 50,
    default: ChatSessionStatus.ACTIVE,
  })
  status: ChatSessionStatus;

  // Contact Visibility (CRITICAL)
  @Column({ name: 'buyer_can_see_seller_contact', type: 'boolean', default: false })
  buyerCanSeeSellerContact: boolean; // Only after CS approval

  @Column({ name: 'seller_can_see_buyer_contact', type: 'boolean', default: false })
  sellerCanSeeBuyerContact: boolean; // Only after CS approval

  @Column({ name: 'contact_revealed_at', type: 'timestamptz', nullable: true })
  contactRevealedAt?: Date | null;

  // Session Metadata
  @Column({ name: 'started_at', type: 'timestamptz', default: () => 'NOW()' })
  startedAt: Date;

  @Column({ name: 'ended_at', type: 'timestamptz', nullable: true })
  endedAt?: Date | null;

  @Column({ name: 'last_message_at', type: 'timestamptz', nullable: true })
  lastMessageAt?: Date | null;

  @Column({ name: 'message_count', type: 'int', default: 0 })
  messageCount: number;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => InterestExpression, (expression) => expression.chatSessions)
  @JoinColumn({ name: 'interest_expression_id' })
  interestExpression: InterestExpression;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'buyer_id' })
  buyer: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'seller_id' })
  seller: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'cs_agent_id' })
  csAgent: User;

  @OneToMany(() => ChatMessage, (message) => message.chatSession)
  messages: ChatMessage[];
}
