import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { UserRole } from '../../auth/entities/user-role.entity';
import { LoginSession } from '../../auth/entities/login-session.entity';

export type UserStatus = 'pending' | 'active' | 'suspended' | 'banned';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'primary_phone', type: 'varchar', length: 32, unique: true, nullable: true })
  primaryPhone?: string | null;

  @Column({ name: 'primary_email', type: 'varchar', length: 255, unique: true, nullable: true })
  primaryEmail?: string | null;

  @Column({ name: 'full_name', type: 'varchar', length: 255, nullable: true })
  fullName?: string | null;

  @Column({ name: 'avatar_url', type: 'text', nullable: true })
  avatarUrl?: string | null;

  @Column({ name: 'address', type: 'text', nullable: true })
  address?: string | null;

  @Column({ name: 'password_hash', type: 'text', nullable: true })
  passwordHash?: string | null;

  @Column({ name: 'firebase_uid', type: 'varchar', length: 255, unique: true, nullable: true })
  firebaseUid?: string | null;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'pending',
  })
  status: UserStatus;

  @Column({ name: 'fraud_risk_score', type: 'smallint', default: 0 })
  fraudRiskScore: number;

  @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true })
  lastLoginAt?: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date | null;

  @OneToMany(() => UserRole, (userRole) => userRole.user)
  userRoles: UserRole[];

  @OneToMany(() => LoginSession, (session) => session.user)
  loginSessions: LoginSession[];
}
