import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import { Property } from './property.entity';

@Entity('property_features')
@Unique(['propertyId', 'featureKey'])
@Index(['propertyId'])
export class PropertyFeature {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'property_id', type: 'uuid' })
  propertyId: string;

  @Column({ name: 'feature_key', type: 'varchar', length: 100 })
  featureKey: string; // e.g., 'parking', 'lift', 'security', 'swimming_pool'

  @Column({ name: 'feature_value', type: 'text', nullable: true })
  featureValue?: string | null; // e.g., 'covered', '2 wheeler + 4 wheeler'

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => Property, (property) => property.propertyFeatures, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  property: Property;
}
