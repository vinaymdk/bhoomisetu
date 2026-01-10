import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { Subscription } from '../../subscriptions/entities/subscription.entity';
import { SubscriptionTransaction } from './subscription-transaction.entity';

export enum PlanType {
  PREMIUM_SELLER = 'premium_seller',
  PREMIUM_BUYER = 'premium_buyer',
  FEATURED_LISTING = 'featured_listing',
}

export enum BillingPeriod {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUAL = 'annual',
  ONE_TIME = 'one_time',
}

@Entity('subscription_plans')
@Index(['name'])
@Index(['planType'])
@Index(['billingPeriod'])
@Index(['isActive'])
@Index(['isFeatured'])
export class SubscriptionPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ name: 'display_name', type: 'varchar', length: 255 })
  displayName: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ name: 'plan_type', type: 'varchar', length: 50 })
  planType: PlanType;

  @Column({ name: 'billing_period', type: 'varchar', length: 20 })
  billingPeriod: BillingPeriod;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'varchar', length: 3, default: 'INR' })
  currency: string;

  @Column({ type: 'jsonb' })
  features: Record<string, any>; // { priority_listing: true, faster_mediation: true, featured_badge: true, ... }

  @Column({ name: 'duration_days', type: 'int' })
  durationDays: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'is_featured', type: 'boolean', default: false })
  isFeatured: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => Subscription, (subscription) => subscription.plan)
  subscriptions: Subscription[];

  @OneToMany(() => SubscriptionTransaction, (transaction) => transaction.plan)
  transactions: SubscriptionTransaction[];
}
