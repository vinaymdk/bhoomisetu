import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('notification_templates')
@Index(['name'])
@Index(['type'])
@Index(['isActive'])
export class NotificationTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  type: string;

  // Template Content
  @Column({ name: 'title_template', type: 'text' })
  titleTemplate: string;

  @Column({ name: 'message_template', type: 'text' })
  messageTemplate: string;

  @Column({ name: 'title_template_telugu', type: 'text', nullable: true })
  titleTemplateTelugu?: string | null;

  @Column({ name: 'message_template_telugu', type: 'text', nullable: true })
  messageTemplateTelugu?: string | null;

  // Channel-specific templates
  @Column({ name: 'push_title_template', type: 'text', nullable: true })
  pushTitleTemplate?: string | null;

  @Column({ name: 'push_message_template', type: 'text', nullable: true })
  pushMessageTemplate?: string | null;

  @Column({ name: 'sms_template', type: 'text', nullable: true })
  smsTemplate?: string | null;

  @Column({ name: 'email_subject_template', type: 'text', nullable: true })
  emailSubjectTemplate?: string | null;

  @Column({ name: 'email_body_template', type: 'text', nullable: true })
  emailBodyTemplate?: string | null;

  // Template Variables
  @Column({ type: 'jsonb', nullable: true })
  variables?: string[] | null;

  // Status
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
