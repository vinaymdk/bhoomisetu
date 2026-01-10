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
import { BuyerRequirement } from './buyer-requirement.entity';
import { Property } from '../../properties/entities/property.entity';

@Entity('property_requirement_matches')
@Unique(['buyerRequirementId', 'propertyId'])
@Index(['buyerRequirementId'])
@Index(['propertyId'])
@Index(['overallMatchScore'])
@Index(['budgetOverlapPercentage'])
export class PropertyRequirementMatch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'buyer_requirement_id', type: 'uuid' })
  buyerRequirementId: string;

  @Column({ name: 'property_id', type: 'uuid' })
  propertyId: string;

  // Match Scores (0-100)
  @Column({ name: 'location_match_score', type: 'decimal', precision: 5, scale: 2, default: 0 })
  locationMatchScore: number;

  @Column({ name: 'budget_match_score', type: 'decimal', precision: 5, scale: 2, default: 0 })
  budgetMatchScore: number;

  @Column({ name: 'overall_match_score', type: 'decimal', precision: 5, scale: 2, default: 0 })
  overallMatchScore: number;

  // Match Details
  @Column({ name: 'budget_overlap_percentage', type: 'decimal', precision: 5, scale: 2, nullable: true })
  budgetOverlapPercentage?: number | null;

  @Column({ name: 'location_match_type', type: 'varchar', length: 50, nullable: true })
  locationMatchType?: string | null;

  @Column({ name: 'match_reasons', type: 'jsonb', nullable: true })
  matchReasons?: string[] | null;

  // Notification Status
  @Column({ name: 'notified_seller', type: 'boolean', default: false })
  notifiedSeller: boolean;

  @Column({ name: 'notified_buyer', type: 'boolean', default: false })
  notifiedBuyer: boolean;

  @Column({ name: 'notified_cs', type: 'boolean', default: false })
  notifiedCs: boolean;

  @Column({ name: 'notified_at', type: 'timestamptz', nullable: true })
  notifiedAt?: Date | null;

  // Buyer Interest (Module 7 - placeholder)
  @Column({ name: 'buyer_interested', type: 'boolean', default: false })
  buyerInterested: boolean;

  @Column({ name: 'buyer_interested_at', type: 'timestamptz', nullable: true })
  buyerInterestedAt?: Date | null;

  // CS Action (Module 7 - placeholder)
  @Column({ name: 'cs_reviewed', type: 'boolean', default: false })
  csReviewed: boolean;

  @Column({ name: 'cs_reviewed_at', type: 'timestamptz', nullable: true })
  csReviewedAt?: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => BuyerRequirement, (requirement) => requirement.matches)
  @JoinColumn({ name: 'buyer_requirement_id' })
  requirement: BuyerRequirement;

  @ManyToOne(() => Property)
  @JoinColumn({ name: 'property_id' })
  property: Property;
}
