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
import { SupportChatSession } from './support-chat-session.entity';
import { User } from '../../users/entities/user.entity';

export enum SupportMessageType {
  TEXT = 'text',
}

@Entity('support_chat_messages')
@Index(['sessionId'])
@Index(['senderId'])
@Index(['createdAt'])
@Index(['readAt'])
export class SupportChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'session_id', type: 'uuid' })
  sessionId: string;

  @Column({ name: 'sender_id', type: 'uuid' })
  senderId: string;

  @Column({ name: 'sender_role', type: 'varchar', length: 30 })
  senderRole: 'user' | 'support';

  @Column({ name: 'message_type', type: 'varchar', length: 20, default: SupportMessageType.TEXT })
  messageType: SupportMessageType;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'delivered_at', type: 'timestamptz', nullable: true })
  deliveredAt?: Date | null;

  @Column({ name: 'read_at', type: 'timestamptz', nullable: true })
  readAt?: Date | null;

  @Column({ name: 'is_edited', type: 'boolean', default: false })
  isEdited: boolean;

  @Column({ name: 'edited_at', type: 'timestamptz', nullable: true })
  editedAt?: Date | null;

  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted: boolean;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => SupportChatSession, (session) => session.messages)
  @JoinColumn({ name: 'session_id' })
  session: SupportChatSession;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sender_id' })
  sender: User;
}
