import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('notification_preferences')
@Unique(['userId'])
@Index(['userId'])
@Index(['fcmToken'])
export class NotificationPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  // Channel Preferences
  @Column({ name: 'push_enabled', type: 'boolean', default: true })
  pushEnabled: boolean;

  @Column({ name: 'sms_enabled', type: 'boolean', default: true })
  smsEnabled: boolean;

  @Column({ name: 'email_enabled', type: 'boolean', default: true })
  emailEnabled: boolean;

  // Notification Type Preferences
  @Column({ name: 'property_match_enabled', type: 'boolean', default: true })
  propertyMatchEnabled: boolean;

  @Column({ name: 'price_drop_enabled', type: 'boolean', default: true })
  priceDropEnabled: boolean;

  @Column({ name: 'viewing_reminder_enabled', type: 'boolean', default: true })
  viewingReminderEnabled: boolean;

  @Column({ name: 'subscription_renewal_enabled', type: 'boolean', default: true })
  subscriptionRenewalEnabled: boolean;

  @Column({ name: 'cs_followup_enabled', type: 'boolean', default: true })
  csFollowupEnabled: boolean;

  @Column({ name: 'interest_expression_enabled', type: 'boolean', default: true })
  interestExpressionEnabled: boolean;

  @Column({ name: 'mediation_update_enabled', type: 'boolean', default: true })
  mediationUpdateEnabled: boolean;

  @Column({ name: 'ai_chat_escalation_enabled', type: 'boolean', default: true })
  aiChatEscalationEnabled: boolean;

  // Quiet Hours
  @Column({ name: 'quiet_hours_start', type: 'time', nullable: true })
  quietHoursStart?: string | null;

  @Column({ name: 'quiet_hours_end', type: 'time', nullable: true })
  quietHoursEnd?: string | null;

  // Device/Channel Info
  @Column({ name: 'fcm_token', type: 'varchar', length: 500, nullable: true })
  fcmToken?: string | null; // Firebase Cloud Messaging token

  @Column({ name: 'phone_number', type: 'varchar', length: 20, nullable: true })
  phoneNumber?: string | null;

  @Column({ name: 'email_address', type: 'varchar', length: 255, nullable: true })
  emailAddress?: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
