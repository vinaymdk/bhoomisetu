import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('ai_chat_faqs')
@Index(['category'])
@Index(['tags'])
@Index(['isActive'])
export class AiChatFaq {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'question_english', type: 'text' })
  questionEnglish: string;

  @Column({ name: 'question_telugu', type: 'text' })
  questionTelugu: string;

  @Column({ name: 'answer_english', type: 'text' })
  answerEnglish: string;

  @Column({ name: 'answer_telugu', type: 'text' })
  answerTelugu: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  category?: string | null;

  @Column({ type: 'text', array: true, nullable: true })
  tags?: string[] | null;

  @Column({ name: 'view_count', type: 'int', default: 0 })
  viewCount: number;

  @Column({ name: 'helpful_count', type: 'int', default: 0 })
  helpfulCount: number;

  @Column({ name: 'not_helpful_count', type: 'int', default: 0 })
  notHelpfulCount: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
