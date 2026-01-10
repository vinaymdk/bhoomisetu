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
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Property } from '../../properties/entities/property.entity';
import { PropertyRequirementMatch } from '../../buyer-requirements/entities/property-requirement-match.entity';
import { CsMediationAction } from './cs-mediation-action.entity';
import { ChatSession } from './chat-session.entity';

export enum InterestType {
  VIEWING = 'viewing',
  OFFER = 'offer',
  NEGOTIATION = 'negotiation',
  SERIOUS_INTENT = 'serious_intent',
}

export enum InterestPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum ConnectionStatus {
  PENDING = 'pending',
  CS_REVIEWING = 'cs_reviewing',
  SELLER_CHECKING = 'seller_checking',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CONNECTED = 'connected',
}

@Entity('interest_expressions')
@Unique(['buyerId', 'propertyId'])
@Index(['buyerId'])
@Index(['propertyId'])
@Index(['matchId'])
@Index(['connectionStatus'])
@Index(['csAgentId'])
@Index(['createdAt'])
export class InterestExpression {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'buyer_id', type: 'uuid' })
  buyerId: string;

  @Column({ name: 'property_id', type: 'uuid' })
  propertyId: string;

  @Column({ name: 'match_id', type: 'uuid', nullable: true })
  matchId?: string | null;

  // Interest Details
  @Column({ type: 'text', nullable: true })
  message?: string | null;

  @Column({
    name: 'interest_type',
    type: 'varchar',
    length: 50,
    default: InterestType.VIEWING,
  })
  interestType: InterestType;

  @Column({
    type: 'varchar',
    length: 20,
    default: InterestPriority.NORMAL,
  })
  priority: InterestPriority;

  // CS Review Status
  @Column({ name: 'cs_reviewed', type: 'boolean', default: false })
  csReviewed: boolean;

  @Column({ name: 'cs_agent_id', type: 'uuid', nullable: true })
  csAgentId?: string | null;

  @Column({ name: 'buyer_seriousness_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  buyerSeriousnessScore?: number | null;

  @Column({ name: 'buyer_seriousness_notes', type: 'text', nullable: true })
  buyerSeriousnessNotes?: string | null;

  @Column({ name: 'cs_reviewed_at', type: 'timestamptz', nullable: true })
  csReviewedAt?: Date | null;

  // Seller Willingness Check
  @Column({ name: 'seller_willingness_checked', type: 'boolean', default: false })
  sellerWillingnessChecked: boolean;

  @Column({ name: 'seller_willingness_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  sellerWillingnessScore?: number | null;

  @Column({ name: 'seller_willingness_notes', type: 'text', nullable: true })
  sellerWillingnessNotes?: string | null;

  @Column({ name: 'seller_willingness_checked_at', type: 'timestamptz', nullable: true })
  sellerWillingnessCheckedAt?: Date | null;

  // Connection Status (CRITICAL)
  @Column({
    name: 'connection_status',
    type: 'varchar',
    length: 50,
    default: ConnectionStatus.PENDING,
  })
  connectionStatus: ConnectionStatus;

  @Column({ name: 'connection_approved_at', type: 'timestamptz', nullable: true })
  connectionApprovedAt?: Date | null;

  @Column({ name: 'connection_approved_by', type: 'uuid', nullable: true })
  connectionApprovedBy?: string | null;

  // Contact Reveal (CRITICAL - Seller contact hidden until CS approval)
  @Column({ name: 'seller_contact_revealed', type: 'boolean', default: false })
  sellerContactRevealed: boolean; // CRITICAL: Only true after CS approval

  @Column({ name: 'seller_contact_revealed_at', type: 'timestamptz', nullable: true })
  sellerContactRevealedAt?: Date | null;

  // Chat/Call Session (enabled ONLY after CS approval)
  @Column({ name: 'chat_session_id', type: 'uuid', nullable: true })
  chatSessionId?: string | null;

  @Column({ name: 'call_session_id', type: 'uuid', nullable: true })
  callSessionId?: string | null;

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

  @ManyToOne(() => Property)
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @ManyToOne(() => PropertyRequirementMatch, { nullable: true })
  @JoinColumn({ name: 'match_id' })
  match?: PropertyRequirementMatch | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'cs_agent_id' })
  csAgent?: User | null;

  @OneToMany(() => CsMediationAction, (action) => action.interestExpression)
  mediationActions: CsMediationAction[];

  @OneToMany(() => ChatSession, (session) => session.interestExpression)
  chatSessions: ChatSession[];
}
