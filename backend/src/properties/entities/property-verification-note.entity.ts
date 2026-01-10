import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Property } from './property.entity';
import { User } from '../../users/entities/user.entity';

export enum UrgencyLevel {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Entity('property_verification_notes')
@Index(['propertyId'])
@Index(['csAgentId'])
export class PropertyVerificationNote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'property_id', type: 'uuid' })
  propertyId: string;

  @Column({ name: 'cs_agent_id', type: 'uuid' })
  csAgentId: string;

  @Column({
    name: 'urgency_level',
    type: 'varchar',
    length: 20,
    default: UrgencyLevel.NORMAL,
  })
  urgencyLevel: UrgencyLevel;

  @Column({ name: 'negotiation_notes', type: 'text', nullable: true })
  negotiationNotes?: string | null;

  @Column({ type: 'text', nullable: true })
  remarks?: string | null;

  @CreateDateColumn({ name: 'verified_at', type: 'timestamptz' })
  verifiedAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => Property, (property) => property.verificationNotes)
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'cs_agent_id' })
  csAgent: User;
}
