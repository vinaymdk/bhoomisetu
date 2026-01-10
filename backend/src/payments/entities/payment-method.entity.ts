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
import { Payment } from './payment.entity';

export enum PaymentGateway {
  RAZORPAY = 'razorpay',
  STRIPE = 'stripe',
}

export enum CardBrand {
  VISA = 'visa',
  MASTERCARD = 'mastercard',
  RUPAY = 'rupay',
  AMEX = 'amex',
  DINERS = 'diners',
  DISCOVER = 'discover',
  JCB = 'jcb',
  OTHER = 'other',
}

export enum CardType {
  CREDIT = 'credit',
  DEBIT = 'debit',
  PREPAID = 'prepaid',
}

@Entity('payment_methods')
@Index(['userId'])
@Index(['gateway'])
@Index(['gatewayPaymentMethodId'])
@Index(['isDefault'])
@Index(['isActive'])
@Index(['fraudRiskScore'])
@Index(['duplicateCardFlagged'])
@Index(['locationMismatchFlagged'])
export class PaymentMethod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  // Payment Gateway
  @Column({ type: 'varchar', length: 50 })
  gateway: PaymentGateway;

  @Column({ name: 'gateway_payment_method_id', type: 'varchar', length: 255 })
  gatewayPaymentMethodId: string;

  // Card Details (masked)
  @Column({ name: 'card_last4', type: 'varchar', length: 4, nullable: true })
  cardLast4?: string | null;

  @Column({ name: 'card_brand', type: 'varchar', length: 50, nullable: true })
  cardBrand?: CardBrand | null;

  @Column({ name: 'card_type', type: 'varchar', length: 20, nullable: true })
  cardType?: CardType | null;

  @Column({ name: 'card_expiry_month', type: 'int', nullable: true })
  cardExpiryMonth?: number | null;

  @Column({ name: 'card_expiry_year', type: 'int', nullable: true })
  cardExpiryYear?: number | null;

  // Billing Address
  @Column({ name: 'billing_name', type: 'varchar', length: 255, nullable: true })
  billingName?: string | null;

  @Column({ name: 'billing_email', type: 'varchar', length: 255, nullable: true })
  billingEmail?: string | null;

  @Column({ name: 'billing_phone', type: 'varchar', length: 20, nullable: true })
  billingPhone?: string | null;

  @Column({ name: 'billing_address_line1', type: 'text', nullable: true })
  billingAddressLine1?: string | null;

  @Column({ name: 'billing_address_line2', type: 'text', nullable: true })
  billingAddressLine2?: string | null;

  @Column({ name: 'billing_city', type: 'varchar', length: 100, nullable: true })
  billingCity?: string | null;

  @Column({ name: 'billing_state', type: 'varchar', length: 100, nullable: true })
  billingState?: string | null;

  @Column({ name: 'billing_country', type: 'varchar', length: 100, default: 'India' })
  billingCountry: string;

  @Column({ name: 'billing_pincode', type: 'varchar', length: 20, nullable: true })
  billingPincode?: string | null;

  // Status
  @Column({ name: 'is_default', type: 'boolean', default: false })
  isDefault: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  // AI Risk Checks
  @Column({ name: 'fraud_risk_score', type: 'smallint', default: 0 })
  fraudRiskScore: number;

  @Column({ name: 'duplicate_card_flagged', type: 'boolean', default: false })
  duplicateCardFlagged: boolean;

  @Column({ name: 'location_mismatch_flagged', type: 'boolean', default: false })
  locationMismatchFlagged: boolean;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Payment, (payment) => payment.paymentMethod)
  payments: Payment[];
}
