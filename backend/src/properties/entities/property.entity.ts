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
import { PropertyImage } from './property-image.entity';
import { PropertyFeature } from './property-feature.entity';
import { PropertyVerificationNote } from './property-verification-note.entity';

export enum PropertyType {
  APARTMENT = 'apartment',
  HOUSE = 'house',
  VILLA = 'villa',
  PLOT = 'plot',
  COMMERCIAL = 'commercial',
  OFFICE = 'office',
  SHOP = 'shop',
  WAREHOUSE = 'warehouse',
  AGRICULTURAL = 'agricultural',
  OTHER = 'other',
}

export enum ListingType {
  SALE = 'sale',
  RENT = 'rent',
}

export enum PropertyStatus {
  DRAFT = 'draft',
  PENDING_VERIFICATION = 'pending_verification',
  VERIFIED = 'verified',
  LIVE = 'live',
  SOLD = 'sold',
  RENTED = 'rented',
  EXPIRED = 'expired',
  REJECTED = 'rejected',
}

@Entity('properties')
@Index(['city'])
@Index(['status'])
@Index(['listingType'])
@Index(['propertyType'])
@Index(['createdAt'])
@Index(['isFeatured'], { where: 'isFeatured = true' })
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'seller_id', type: 'uuid' })
  sellerId: string;

  @Column({
    name: 'property_type',
    type: 'enum',
    enum: PropertyType,
  })
  propertyType: PropertyType;

  @Column({
    name: 'listing_type',
    type: 'enum',
    enum: ListingType,
  })
  listingType: ListingType;

  @Column({
    type: 'enum',
    enum: PropertyStatus,
    default: PropertyStatus.DRAFT,
  })
  status: PropertyStatus;

  // Location
  @Column({ type: 'text' })
  address: string;

  @Column({ type: 'varchar', length: 100 })
  city: string;

  @Column({ type: 'varchar', length: 100 })
  state: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  pincode?: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  locality?: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  landmark?: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude?: number | null;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude?: number | null;

  // Property Details
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  area: number;

  @Column({ name: 'area_unit', type: 'varchar', length: 10, default: 'sqft' })
  areaUnit: string;

  @Column({ type: 'int', nullable: true })
  bedrooms?: number | null;

  @Column({ type: 'int', nullable: true })
  bathrooms?: number | null;

  @Column({ type: 'int', nullable: true })
  balconies?: number | null;

  @Column({ type: 'int', nullable: true })
  floors?: number | null;

  @Column({ name: 'floor_number', type: 'int', nullable: true })
  floorNumber?: number | null;

  @Column({ name: 'furnishing_status', type: 'varchar', length: 50, nullable: true })
  furnishingStatus?: string | null;

  @Column({ name: 'age_of_construction', type: 'int', nullable: true })
  ageOfConstruction?: number | null;

  // Features as JSONB
  @Column({ type: 'jsonb', nullable: true })
  features?: Record<string, any> | null;

  // Verification
  @Column({ name: 'verified_at', type: 'timestamptz', nullable: true })
  verifiedAt?: Date | null;

  @Column({ name: 'verified_by', type: 'uuid', nullable: true })
  verifiedBy?: string | null;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason?: string | null;

  // Premium Features
  @Column({ name: 'is_featured', type: 'boolean', default: false })
  isFeatured: boolean;

  @Column({ name: 'is_premium', type: 'boolean', default: false })
  isPremium: boolean;

  @Column({ name: 'featured_until', type: 'timestamptz', nullable: true })
  featuredUntil?: Date | null;

  // Metadata
  @Column({ name: 'views_count', type: 'int', default: 0 })
  viewsCount: number;

  @Column({ name: 'interested_count', type: 'int', default: 0 })
  interestedCount: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date | null;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'seller_id' })
  seller: User;

  @OneToMany(() => PropertyImage, (image) => image.property, { cascade: true })
  images: PropertyImage[];

  @OneToMany(() => PropertyFeature, (feature) => feature.property, { cascade: true })
  propertyFeatures: PropertyFeature[];

  @OneToMany(() => PropertyVerificationNote, (note) => note.property)
  verificationNotes: PropertyVerificationNote[];
}
