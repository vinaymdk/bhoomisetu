import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Review } from './review.entity';
import { User } from '../../users/entities/user.entity';

export enum ReplyStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  HIDDEN = 'hidden',
}

@Entity('review_replies')
@Index(['reviewId'])
@Index(['repliedBy'])
@Index(['status'])
export class ReviewReply {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'review_id', type: 'uuid' })
  reviewId: string;

  @Column({ name: 'replied_by', type: 'uuid' })
  repliedBy: string; // Must be the reviewee (seller/agent)

  @Column({ name: 'reply_text', type: 'text' })
  replyText: string;

  @Column({ type: 'varchar', length: 50, default: ReplyStatus.PENDING })
  status: ReplyStatus;

  @Column({ name: 'moderation_notes', type: 'text', nullable: true })
  moderationNotes?: string | null;

  @Column({ name: 'moderated_by', type: 'uuid', nullable: true })
  moderatedBy?: string | null;

  @Column({ name: 'moderated_at', type: 'timestamptz', nullable: true })
  moderatedAt?: Date | null;

  @Column({ name: 'is_edited', type: 'boolean', default: false })
  isEdited: boolean;

  @Column({ name: 'edited_at', type: 'timestamptz', nullable: true })
  editedAt?: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date | null;

  // Relations
  @ManyToOne(() => Review, (review) => review.replies, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'review_id' })
  review: Review;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'replied_by' })
  replier: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'moderated_by' })
  moderator?: User | null;
}
