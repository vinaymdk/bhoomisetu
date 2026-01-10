import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { PropertyRequirementMatch } from './property-requirement-match.entity';
import { PropertyType, ListingType } from '../../properties/entities/property.entity';

export enum RequirementStatus {
  ACTIVE = 'active',
  FULFILLED = 'fulfilled',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

export enum BudgetType {
  SALE = 'sale',
  RENT = 'rent',
}

@Entity('buyer_requirements')
@Index(['buyerId'])
@Index(['status'])
@Index(['city'])
@Index(['propertyType'])
@Index(['listingType'])
export class BuyerRequirement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'buyer_id', type: 'uuid' })
  buyerId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title?: string | null;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  // Location
  @Column({ type: 'varchar', length: 100 })
  city: string;

  @Column({ type: 'varchar', length: 100 })
  state: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  locality?: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  pincode?: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  landmark?: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude?: number | null;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude?: number | null;

  // Budget
  @Column({ name: 'min_budget', type: 'decimal', precision: 15, scale: 2, nullable: true })
  minBudget?: number | null;

  @Column({ name: 'max_budget', type: 'decimal', precision: 15, scale: 2 })
  maxBudget: number;

  @Column({ name: 'budget_type', type: 'varchar', length: 20, default: BudgetType.SALE })
  budgetType: BudgetType;

  // Property Details
  @Column({ name: 'property_type', type: 'varchar', length: 50, nullable: true })
  propertyType?: PropertyType | null;

  @Column({ name: 'listing_type', type: 'varchar', length: 20, nullable: true })
  listingType?: ListingType | null;

  // Specific Requirements
  @Column({ name: 'min_area', type: 'decimal', precision: 10, scale: 2, nullable: true })
  minArea?: number | null;

  @Column({ name: 'max_area', type: 'decimal', precision: 10, scale: 2, nullable: true })
  maxArea?: number | null;

  @Column({ name: 'area_unit', type: 'varchar', length: 10, default: 'sqft' })
  areaUnit: string;

  @Column({ type: 'int', nullable: true })
  bedrooms?: number | null;

  @Column({ type: 'int', nullable: true })
  bathrooms?: number | null;

  // Required Features (JSONB)
  @Column({ name: 'required_features', type: 'jsonb', nullable: true })
  requiredFeatures?: string[] | null;

  // Status
  @Column({
    type: 'varchar',
    length: 20,
    default: RequirementStatus.ACTIVE,
  })
  status: RequirementStatus;

  // Matching & Notifications
  @Column({ name: 'match_count', type: 'int', default: 0 })
  matchCount: number;

  @Column({ name: 'last_matched_at', type: 'timestamptz', nullable: true })
  lastMatchedAt?: Date | null;

  // Expiry
  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt?: Date | null;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date | null;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'buyer_id' })
  buyer: User;

  @OneToMany(() => PropertyRequirementMatch, (match) => match.requirement)
  matches: PropertyRequirementMatch[];
}
