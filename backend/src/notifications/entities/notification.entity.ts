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
import { NotificationDeliveryLog } from './notification-delivery-log.entity';

export enum NotificationType {
  PROPERTY_MATCH = 'property_match',
  PRICE_DROP = 'price_drop',
  VIEWING_REMINDER = 'viewing_reminder',
  SUBSCRIPTION_RENEWAL = 'subscription_renewal',
  CS_FOLLOWUP = 'cs_followup',
  INTEREST_EXPRESSION = 'interest_expression',
  MEDIATION_UPDATE = 'mediation_update',
  AI_CHAT_ESCALATION = 'ai_chat_escalation',
  ACTION_ALERT = 'action_alert',
  GENERAL = 'general',
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  READ = 'read',
}

@Entity('notifications')
@Index(['userId'])
@Index(['type'])
@Index(['status'])
@Index(['createdAt'])
@Index(['readAt'])
@Index(['expiresAt'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  // Notification Details
  @Column({ type: 'varchar', length: 50 })
  type: NotificationType;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ name: 'message_english', type: 'text', nullable: true })
  messageEnglish?: string | null;

  @Column({ name: 'message_telugu', type: 'text', nullable: true })
  messageTelugu?: string | null;

  // Notification Data
  @Column({ type: 'jsonb', nullable: true })
  data?: Record<string, any> | null;

  // Priority
  @Column({
    type: 'varchar',
    length: 20,
    default: NotificationPriority.NORMAL,
  })
  priority: NotificationPriority;

  // Status
  @Column({
    type: 'varchar',
    length: 50,
    default: NotificationStatus.PENDING,
  })
  status: NotificationStatus;

  @Column({ name: 'read_at', type: 'timestamptz', nullable: true })
  readAt?: Date | null;

  // Delivery Channels
  @Column({ name: 'channels_sent', type: 'text', array: true, nullable: true })
  channelsSent?: string[] | null; // ['push', 'sms', 'email']

  @Column({ name: 'push_sent', type: 'boolean', default: false })
  pushSent: boolean;

  @Column({ name: 'sms_sent', type: 'boolean', default: false })
  smsSent: boolean;

  @Column({ name: 'email_sent', type: 'boolean', default: false })
  emailSent: boolean;

  // Delivery Timestamps
  @Column({ name: 'push_sent_at', type: 'timestamptz', nullable: true })
  pushSentAt?: Date | null;

  @Column({ name: 'sms_sent_at', type: 'timestamptz', nullable: true })
  smsSentAt?: Date | null;

  @Column({ name: 'email_sent_at', type: 'timestamptz', nullable: true })
  emailSentAt?: Date | null;

  // Error Handling
  @Column({ name: 'delivery_error', type: 'text', nullable: true })
  deliveryError?: string | null;

  @Column({ name: 'retry_count', type: 'int', default: 0 })
  retryCount: number;

  @Column({ name: 'max_retries', type: 'int', default: 3 })
  maxRetries: number;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt?: Date | null;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => NotificationDeliveryLog, (log) => log.notification)
  deliveryLogs: NotificationDeliveryLog[];
}
