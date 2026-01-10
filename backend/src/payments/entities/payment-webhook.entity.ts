import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Payment } from './payment.entity';
import { PaymentGateway } from './payment-method.entity';

@Entity('payment_webhooks')
@Index(['gateway'])
@Index(['eventId'])
@Index(['paymentId'])
@Index(['processed'])
@Index(['createdAt'])
export class PaymentWebhook {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Webhook Details
  @Column({ type: 'varchar', length: 50 })
  gateway: PaymentGateway;

  @Column({ name: 'event_type', type: 'varchar', length: 100 })
  eventType: string;

  @Column({ name: 'event_id', type: 'varchar', length: 255 })
  eventId: string;

  // Payment Reference
  @Column({ name: 'payment_id', type: 'uuid', nullable: true })
  paymentId?: string | null;

  @Column({ name: 'gateway_order_id', type: 'varchar', length: 255, nullable: true })
  gatewayOrderId?: string | null;

  @Column({ name: 'gateway_payment_id', type: 'varchar', length: 255, nullable: true })
  gatewayPaymentId?: string | null;

  // Webhook Payload
  @Column({ type: 'jsonb' })
  payload: Record<string, any>;

  @Column({ type: 'varchar', length: 500, nullable: true })
  signature?: string | null;

  // Processing Status
  @Column({ type: 'boolean', default: false })
  processed: boolean;

  @Column({ name: 'processed_at', type: 'timestamptz', nullable: true })
  processedAt?: Date | null;

  @Column({ name: 'processing_error', type: 'text', nullable: true })
  processingError?: string | null;

  // Retry Logic
  @Column({ name: 'retry_count', type: 'int', default: 0 })
  retryCount: number;

  @Column({ name: 'max_retries', type: 'int', default: 3 })
  maxRetries: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => Payment, { nullable: true })
  @JoinColumn({ name: 'payment_id' })
  payment?: Payment | null;
}
