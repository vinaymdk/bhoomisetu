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
import { SubscriptionPlan } from '../../payments/entities/subscription-plan.entity';
import { SubscriptionTransaction } from '../../payments/entities/subscription-transaction.entity';

export enum SubscriptionType {
  PREMIUM_SELLER = 'premium_seller',
  PREMIUM_BUYER = 'premium_buyer',
  FEATURED_LISTING = 'featured_listing',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

@Entity('subscriptions')
@Index(['userId'])
@Index(['status'])
@Index(['expiresAt'])
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'subscription_type', type: 'varchar', length: 50 })
  subscriptionType: SubscriptionType;

  @Column({
    type: 'varchar',
    length: 20,
    default: SubscriptionStatus.ACTIVE,
  })
  status: SubscriptionStatus;

  @Column({ name: 'starts_at', type: 'timestamptz', default: () => 'NOW()' })
  startsAt: Date;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @Column({ name: 'payment_id', type: 'varchar', length: 255, nullable: true })
  paymentId?: string | null;

  @Column({ name: 'amount_paid', type: 'decimal', precision: 10, scale: 2, nullable: true })
  amountPaid?: number | null;

  @Column({ name: 'subscription_plan_id', type: 'uuid', nullable: true })
  subscriptionPlanId?: string | null;

  @Column({ name: 'auto_renewal_enabled', type: 'boolean', default: false })
  autoRenewalEnabled: boolean;

  @Column({ name: 'next_billing_date', type: 'timestamptz', nullable: true })
  nextBillingDate?: Date | null;

  @Column({ name: 'cancelled_at', type: 'timestamptz', nullable: true })
  cancelledAt?: Date | null;

  @Column({ name: 'cancellation_reason', type: 'text', nullable: true })
  cancellationReason?: string | null;

  @Column({ name: 'payment_method_id', type: 'uuid', nullable: true })
  paymentMethodId?: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => SubscriptionPlan, { nullable: true })
  @JoinColumn({ name: 'subscription_plan_id' })
  plan?: SubscriptionPlan | null;

  @OneToMany(() => SubscriptionTransaction, (transaction) => transaction.subscription)
  transactions: SubscriptionTransaction[];
}
