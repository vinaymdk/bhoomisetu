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
import { InterestExpression } from '../../mediation/entities/interest-expression.entity';
import { ChatSession } from '../../mediation/entities/chat-session.entity';
import { ReviewHelpfulVote } from './review-helpful-vote.entity';
import { ReviewReport } from './review-report.entity';
import { ReviewReply } from './review-reply.entity';

export enum ReviewType {
  PROPERTY = 'property',
  SELLER = 'seller',
  EXPERIENCE = 'experience',
  DEAL = 'deal',
}

export enum ReviewContext {
  AFTER_VIEWING = 'after_viewing',
  AFTER_DEAL = 'after_deal',
  AFTER_INTERACTION = 'after_interaction',
}

export enum ReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  FLAGGED = 'flagged',
  HIDDEN = 'hidden',
}

export enum SentimentLabel {
  POSITIVE = 'positive',
  NEGATIVE = 'negative',
  NEUTRAL = 'neutral',
  MIXED = 'mixed',
}

@Entity('reviews')
@Index(['reviewerId'])
@Index(['revieweeId'])
@Index(['propertyId'])
@Index(['interestExpressionId'])
@Index(['chatSessionId'])
@Index(['reviewType'])
@Index(['status'])
@Index(['overallRating'])
@Index(['sentimentScore'])
@Index(['fakeReviewDetected'])
@Index(['createdAt'])
@Index(['isVerifiedPurchase'])
@Unique(['reviewerId', 'revieweeId', 'propertyId'], {
  where: '"property_id" IS NOT NULL AND "deleted_at" IS NULL',
})
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'reviewer_id', type: 'uuid' })
  reviewerId: string;

  @Column({ name: 'reviewee_id', type: 'uuid' })
  revieweeId: string; // Seller/Agent being reviewed

  @Column({ name: 'property_id', type: 'uuid', nullable: true })
  propertyId?: string | null; // Property being reviewed (optional)

  @Column({ name: 'interest_expression_id', type: 'uuid', nullable: true })
  interestExpressionId?: string | null; // Link to interest expression (for viewing review)

  @Column({ name: 'chat_session_id', type: 'uuid', nullable: true })
  chatSessionId?: string | null; // Link to chat session (for deal review)

  @Column({ name: 'review_type', type: 'varchar', length: 50 })
  reviewType: ReviewType;

  @Column({ name: 'review_context', type: 'varchar', length: 50, nullable: true })
  reviewContext?: ReviewContext | null;

  // Ratings
  @Column({ name: 'overall_rating', type: 'decimal', precision: 3, scale: 2 })
  overallRating: number; // 1.0 to 5.0

  @Column({ name: 'property_rating', type: 'decimal', precision: 3, scale: 2, nullable: true })
  propertyRating?: number | null; // For property reviews

  @Column({ name: 'seller_rating', type: 'decimal', precision: 3, scale: 2, nullable: true })
  sellerRating?: number | null; // For seller reviews

  @Column({ name: 'responsiveness_rating', type: 'decimal', precision: 3, scale: 2, nullable: true })
  responsivenessRating?: number | null;

  @Column({ name: 'communication_rating', type: 'decimal', precision: 3, scale: 2, nullable: true })
  communicationRating?: number | null;

  @Column({ name: 'professionalism_rating', type: 'decimal', precision: 3, scale: 2, nullable: true })
  professionalismRating?: number | null;

  // Review Content
  @Column({ type: 'varchar', length: 255, nullable: true })
  title?: string | null;

  @Column({ type: 'text' })
  comment: string; // Review text

  @Column({ type: 'text', nullable: true })
  pros?: string | null; // What was good

  @Column({ type: 'text', nullable: true })
  cons?: string | null; // What could be improved

  // AI Analysis (CRITICAL)
  @Column({ name: 'sentiment_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  sentimentScore?: number | null; // -1.0 (negative) to 1.0 (positive)

  @Column({ name: 'sentiment_label', type: 'varchar', length: 50, nullable: true })
  sentimentLabel?: SentimentLabel | null;

  @Column({ name: 'ai_analysis_performed', type: 'boolean', default: false })
  aiAnalysisPerformed: boolean;

  @Column({ name: 'ai_analysis_result', type: 'jsonb', nullable: true })
  aiAnalysisResult?: Record<string, any> | null; // Detailed AI analysis

  @Column({ name: 'fake_review_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  fakeReviewScore?: number | null; // 0.0 (genuine) to 1.0 (fake)

  @Column({ name: 'fake_review_detected', type: 'boolean', default: false })
  fakeReviewDetected: boolean;

  @Column({ name: 'fake_review_reasons', type: 'text', array: true, nullable: true })
  fakeReviewReasons?: string[] | null; // Reasons for fake detection

  @Column({ name: 'ai_confidence', type: 'decimal', precision: 5, scale: 2, nullable: true })
  aiConfidence?: number | null; // 0.0 to 1.0

  // Review Status
  @Column({ type: 'varchar', length: 50, default: ReviewStatus.PENDING })
  status: ReviewStatus;

  @Column({ name: 'moderation_notes', type: 'text', nullable: true })
  moderationNotes?: string | null;

  @Column({ name: 'moderated_by', type: 'uuid', nullable: true })
  moderatedBy?: string | null;

  @Column({ name: 'moderated_at', type: 'timestamptz', nullable: true })
  moderatedAt?: Date | null;

  // Helpful Votes
  @Column({ name: 'helpful_count', type: 'int', default: 0 })
  helpfulCount: number;

  @Column({ name: 'not_helpful_count', type: 'int', default: 0 })
  notHelpfulCount: number;

  // Metadata
  @Column({ name: 'is_verified_purchase', type: 'boolean', default: false })
  isVerifiedPurchase: boolean; // True if reviewer actually viewed/dealt

  @Column({ name: 'is_anonymous', type: 'boolean', default: false })
  isAnonymous: boolean; // User can choose to post anonymously

  @Column({ name: 'is_edited', type: 'boolean', default: false })
  isEdited: boolean;

  @Column({ name: 'edited_at', type: 'timestamptz', nullable: true })
  editedAt?: Date | null;

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
  @JoinColumn({ name: 'reviewer_id' })
  reviewer: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reviewee_id' })
  reviewee: User;

  @ManyToOne(() => Property, { nullable: true })
  @JoinColumn({ name: 'property_id' })
  property?: Property | null;

  @ManyToOne(() => InterestExpression, { nullable: true })
  @JoinColumn({ name: 'interest_expression_id' })
  interestExpression?: InterestExpression | null;

  @ManyToOne(() => ChatSession, { nullable: true })
  @JoinColumn({ name: 'chat_session_id' })
  chatSession?: ChatSession | null;

  @OneToMany(() => ReviewHelpfulVote, (vote) => vote.review)
  helpfulVotes: ReviewHelpfulVote[];

  @OneToMany(() => ReviewReport, (report) => report.review)
  reports: ReviewReport[];

  @OneToMany(() => ReviewReply, (reply) => reply.review)
  replies: ReviewReply[];
}
