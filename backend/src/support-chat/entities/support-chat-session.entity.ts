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
import { SupportChatMessage } from './support-chat-message.entity';

export enum SupportChatStatus {
  OPEN = 'open',
  CLOSED = 'closed',
}

export enum SupportChatRole {
  CUSTOMER_SERVICE = 'customer_service',
  BUYER = 'buyer',
  SELLER = 'seller',
  AGENT = 'agent',
}

@Entity('support_chat_sessions')
@Index(['userId'])
@Index(['supportRole'])
@Index(['status'])
@Index(['lastMessageAt'])
export class SupportChatSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'support_role', type: 'varchar', length: 50 })
  supportRole: SupportChatRole;

  @Column({
    type: 'varchar',
    length: 20,
    default: SupportChatStatus.OPEN,
  })
  status: SupportChatStatus;

  @Column({ name: 'assigned_agent_id', type: 'uuid', nullable: true })
  assignedAgentId?: string | null;

  @Column({ name: 'typing_by_user_id', type: 'uuid', nullable: true })
  typingByUserId?: string | null;

  @Column({ name: 'typing_at', type: 'timestamptz', nullable: true })
  typingAt?: Date | null;

  @Column({ name: 'last_message_at', type: 'timestamptz', nullable: true })
  lastMessageAt?: Date | null;

  @Column({ name: 'message_count', type: 'int', default: 0 })
  messageCount: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigned_agent_id' })
  assignedAgent?: User | null;

  @OneToMany(() => SupportChatMessage, (message) => message.session)
  messages: SupportChatMessage[];
}
