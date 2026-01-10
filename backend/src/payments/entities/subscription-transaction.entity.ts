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
import { Subscription } from '../../subscriptions/entities/subscription.entity';
import { Payment } from './payment.entity';
import { SubscriptionPlan } from './subscription-plan.entity';

export enum TransactionType {
  INITIAL_PURCHASE = 'initial_purchase',
  RENEWAL = 'renewal',
  UPGRADE = 'upgrade',
  DOWNGRADE = 'downgrade',
  EXTENSION = 'extension',
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

@Entity('subscription_transactions')
@Index(['subscriptionId'])
@Index(['paymentId'])
@Index(['subscriptionPlanId'])
@Index(['status'])
@Index(['autoRenewalEnabled', 'nextBillingDate'])
export class SubscriptionTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'subscription_id', type: 'uuid' })
  subscriptionId: string;

  @Column({ name: 'payment_id', type: 'uuid' })
  paymentId: string;

  @Column({ name: 'subscription_plan_id', type: 'uuid' })
  subscriptionPlanId: string;

  // Transaction Details
  @Column({ name: 'transaction_type', type: 'varchar', length: 50 })
  transactionType: TransactionType;

  // Amount Details
  @Column({ name: 'amount_paid', type: 'decimal', precision: 10, scale: 2 })
  amountPaid: number;

  @Column({ type: 'varchar', length: 3, default: 'INR' })
  currency: string;

  // Period Covered
  @Column({ name: 'period_start', type: 'timestamptz' })
  periodStart: Date;

  @Column({ name: 'period_end', type: 'timestamptz' })
  periodEnd: Date;

  // Status
  @Column({
    type: 'varchar',
    length: 50,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  // Auto-renewal
  @Column({ name: 'auto_renewal_enabled', type: 'boolean', default: false })
  autoRenewalEnabled: boolean;

  @Column({ name: 'next_billing_date', type: 'timestamptz', nullable: true })
  nextBillingDate?: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Subscription)
  @JoinColumn({ name: 'subscription_id' })
  subscription: Subscription;

  @ManyToOne(() => Payment)
  @JoinColumn({ name: 'payment_id' })
  payment: Payment;

  @ManyToOne(() => SubscriptionPlan)
  @JoinColumn({ name: 'subscription_plan_id' })
  plan: SubscriptionPlan;
}
