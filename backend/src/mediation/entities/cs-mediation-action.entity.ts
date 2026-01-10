import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { InterestExpression } from './interest-expression.entity';
import { User } from '../../users/entities/user.entity';

export enum MediationActionType {
  BUYER_SERIOUSNESS_CHECK = 'buyer_seriousness_check',
  SELLER_WILLINGNESS_CHECK = 'seller_willingness_check',
  CONNECTION_APPROVAL = 'connection_approval',
  CONNECTION_REJECTION = 'connection_rejection',
  CONTACT_REVEAL = 'contact_reveal',
  CHAT_ENABLE = 'chat_enable',
  CALL_ENABLE = 'call_enable',
}

export enum MediationActionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
}

export enum MediationOutcome {
  APPROVED = 'approved',
  REJECTED = 'rejected',
  NEEDS_MORE_INFO = 'needs_more_info',
  ESCALATED = 'escalated',
}

@Entity('cs_mediation_actions')
@Index(['interestExpressionId'])
@Index(['csAgentId'])
@Index(['actionType'])
@Index(['performedAt'])
export class CsMediationAction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'interest_expression_id', type: 'uuid' })
  interestExpressionId: string;

  @Column({ name: 'cs_agent_id', type: 'uuid' })
  csAgentId: string;

  // Action Details
  @Column({ name: 'action_type', type: 'varchar', length: 50 })
  actionType: MediationActionType;

  @Column({
    name: 'action_status',
    type: 'varchar',
    length: 50,
    default: MediationActionStatus.PENDING,
  })
  actionStatus: MediationActionStatus;

  // Assessment Scores
  @Column({ name: 'buyer_seriousness_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  buyerSeriousnessScore?: number | null;

  @Column({ name: 'seller_willingness_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  sellerWillingnessScore?: number | null;

  // Notes
  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @Column({ name: 'internal_notes', type: 'text', nullable: true })
  internalNotes?: string | null;

  // Outcome
  @Column({ type: 'varchar', length: 50, nullable: true })
  outcome?: MediationOutcome | null;

  @Column({ name: 'outcome_reason', type: 'text', nullable: true })
  outcomeReason?: string | null;

  @Column({ name: 'performed_at', type: 'timestamptz', default: () => 'NOW()' })
  performedAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => InterestExpression, (expression) => expression.mediationActions)
  @JoinColumn({ name: 'interest_expression_id' })
  interestExpression: InterestExpression;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'cs_agent_id' })
  csAgent: User;
}
