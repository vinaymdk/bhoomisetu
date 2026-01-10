import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ChatSession } from './chat-session.entity';
import { User } from '../../users/entities/user.entity';

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  SYSTEM = 'system',
}

@Entity('chat_messages')
@Index(['chatSessionId'])
@Index(['senderId'])
@Index(['createdAt'])
@Index(['isRead'])
@Index(['isModerated'])
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'chat_session_id', type: 'uuid' })
  chatSessionId: string;

  // Message Details
  @Column({ name: 'sender_id', type: 'uuid' })
  senderId: string;

  @Column({ name: 'sender_role', type: 'varchar', length: 50 })
  senderRole: 'buyer' | 'seller' | 'customer_service';

  @Column({
    name: 'message_type',
    type: 'varchar',
    length: 50,
    default: MessageType.TEXT,
  })
  messageType: MessageType;

  @Column({ type: 'text' })
  content: string;

  // Message Status
  @Column({ name: 'is_read', type: 'boolean', default: false })
  isRead: boolean;

  @Column({ name: 'read_at', type: 'timestamptz', nullable: true })
  readAt?: Date | null;

  @Column({ name: 'is_edited', type: 'boolean', default: false })
  isEdited: boolean;

  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted: boolean;

  // Moderation (CS can moderate messages)
  @Column({ name: 'is_moderated', type: 'boolean', default: false })
  isModerated: boolean;

  @Column({ name: 'moderated_by', type: 'uuid', nullable: true })
  moderatedBy?: string | null;

  @Column({ name: 'moderation_action', type: 'varchar', length: 50, nullable: true })
  moderationAction?: 'approved' | 'flagged' | 'removed' | 'edited' | null;

  @Column({ name: 'moderation_notes', type: 'text', nullable: true })
  moderationNotes?: string | null;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date | null;

  // Relations
  @ManyToOne(() => ChatSession, (session) => session.messages)
  @JoinColumn({ name: 'chat_session_id' })
  chatSession: ChatSession;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'moderated_by' })
  moderator?: User | null;
}
