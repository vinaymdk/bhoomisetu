import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Notification } from './notification.entity';

export enum DeliveryChannel {
  PUSH = 'push',
  SMS = 'sms',
  EMAIL = 'email',
}

export enum DeliveryStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  BOUNCED = 'bounced',
  OPENED = 'opened',
}

@Entity('notification_delivery_logs')
@Index(['notificationId'])
@Index(['channel'])
@Index(['status'])
@Index(['createdAt'])
export class NotificationDeliveryLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'notification_id', type: 'uuid' })
  notificationId: string;

  // Channel Details
  @Column({ type: 'varchar', length: 20 })
  channel: DeliveryChannel;

  // Delivery Status
  @Column({ type: 'varchar', length: 50 })
  status: DeliveryStatus;

  @Column({ name: 'status_message', type: 'text', nullable: true })
  statusMessage?: string | null;

  // Delivery Info
  @Column({ name: 'delivered_at', type: 'timestamptz', nullable: true })
  deliveredAt?: Date | null;

  @Column({ name: 'opened_at', type: 'timestamptz', nullable: true })
  openedAt?: Date | null;

  @Column({ name: 'clicked_at', type: 'timestamptz', nullable: true })
  clickedAt?: Date | null;

  // Provider Response
  @Column({ name: 'provider_message_id', type: 'varchar', length: 255, nullable: true })
  providerMessageId?: string | null;

  @Column({ name: 'provider_response', type: 'jsonb', nullable: true })
  providerResponse?: Record<string, any> | null;

  // Error Details
  @Column({ name: 'error_code', type: 'varchar', length: 50, nullable: true })
  errorCode?: string | null;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage?: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => Notification, (notification) => notification.deliveryLogs)
  @JoinColumn({ name: 'notification_id' })
  notification: Notification;
}
