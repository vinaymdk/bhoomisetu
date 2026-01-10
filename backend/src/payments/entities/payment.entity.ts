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
import { PaymentMethod } from './payment-method.entity';
import { PaymentGateway } from './payment-method.entity';
import { SubscriptionTransaction } from './subscription-transaction.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled',
}

export enum PaymentPurpose {
  SUBSCRIPTION = 'subscription',
  FEATURED_LISTING = 'featured_listing',
  PRIORITY_MEDIATION = 'priority_mediation',
  ONE_TIME_FEATURE = 'one_time_feature',
}

export enum RelatedEntityType {
  SUBSCRIPTION = 'subscription',
  PROPERTY = 'property',
  MEDIATION_REQUEST = 'mediation_request',
}

@Entity('payments')
@Index(['userId'])
@Index(['gatewayOrderId'])
@Index(['gatewayPaymentId'])
@Index(['status'])
@Index(['purpose'])
@Index(['relatedEntityType', 'relatedEntityId'])
@Index(['createdAt'])
@Index(['fraudRiskScore'])
@Index(['duplicateCardDetected'])
@Index(['locationMismatchDetected'])
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  // Payment Details
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 3, default: 'INR' })
  currency: string;

  // Payment Gateway
  @Column({ type: 'varchar', length: 50 })
  gateway: PaymentGateway;

  @Column({ name: 'gateway_order_id', type: 'varchar', length: 255, nullable: true })
  gatewayOrderId?: string | null;

  @Column({ name: 'gateway_payment_id', type: 'varchar', length: 255, nullable: true })
  gatewayPaymentId?: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  signature?: string | null;

  // Payment Method
  @Column({ name: 'payment_method_id', type: 'uuid', nullable: true })
  paymentMethodId?: string | null;

  // Payment Status
  @Column({
    type: 'varchar',
    length: 50,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  // Payment Purpose
  @Column({ type: 'varchar', length: 50 })
  purpose: PaymentPurpose;

  @Column({ name: 'related_entity_type', type: 'varchar', length: 50, nullable: true })
  relatedEntityType?: RelatedEntityType | null;

  @Column({ name: 'related_entity_id', type: 'uuid', nullable: true })
  relatedEntityId?: string | null;

  // AI Risk Checks
  @Column({ name: 'fraud_risk_score', type: 'smallint', default: 0 })
  fraudRiskScore: number;

  @Column({ name: 'duplicate_card_detected', type: 'boolean', default: false })
  duplicateCardDetected: boolean;

  @Column({ name: 'location_mismatch_detected', type: 'boolean', default: false })
  locationMismatchDetected: boolean;

  @Column({ name: 'ai_check_performed', type: 'boolean', default: false })
  aiCheckPerformed: boolean;

  @Column({ name: 'ai_check_result', type: 'jsonb', nullable: true })
  aiCheckResult?: Record<string, any> | null;

  // Payment Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any> | null;

  @Column({ name: 'failure_reason', type: 'text', nullable: true })
  failureReason?: string | null;

  // Timestamps
  @Column({ name: 'initiated_at', type: 'timestamptz', default: () => 'NOW()' })
  initiatedAt: Date;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt?: Date | null;

  @Column({ name: 'failed_at', type: 'timestamptz', nullable: true })
  failedAt?: Date | null;

  @Column({ name: 'refunded_at', type: 'timestamptz', nullable: true })
  refundedAt?: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => PaymentMethod, { nullable: true })
  @JoinColumn({ name: 'payment_method_id' })
  paymentMethod?: PaymentMethod | null;

  @OneToMany(() => SubscriptionTransaction, (transaction) => transaction.payment)
  subscriptionTransactions: SubscriptionTransaction[];
}
