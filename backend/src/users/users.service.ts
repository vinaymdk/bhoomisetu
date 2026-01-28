import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserRole } from '../auth/entities/user-role.entity';
import { Role } from '../auth/entities/role.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['userRoles', 'userRoles.role'],
    });
  }

  async findByFirebaseUid(firebaseUid: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { firebaseUid },
      relations: ['userRoles', 'userRoles.role'],
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { primaryEmail: email },
      relations: ['userRoles', 'userRoles.role'],
    });
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { primaryPhone: phone },
      relations: ['userRoles', 'userRoles.role'],
    });
  }

  async getUserRoles(userId: string): Promise<string[]> {
    const userRoles = await this.userRoleRepository.find({
      where: { userId },
      relations: ['role'],
    });
    return userRoles.map((ur) => ur.role.code);
  }

  async updateProfile(userId: string, update: {
    fullName?: string;
    primaryPhone?: string;
    primaryEmail?: string;
    address?: string;
    avatarUrl?: string;
  }): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const normalizedEmail = this.normalizeOptionalString(update.primaryEmail);
    const normalizedPhone = this.normalizeOptionalString(update.primaryPhone);
    const normalizedFullName = this.normalizeOptionalString(update.fullName);
    const normalizedAddress = this.normalizeOptionalString(update.address);

    if (normalizedEmail !== undefined) {
      if (normalizedEmail) {
        const existing = await this.userRepository.findOne({ where: { primaryEmail: normalizedEmail } });
        if (existing && existing.id !== userId) {
          throw new BadRequestException('Email already in use');
        }
      }
      user.primaryEmail = normalizedEmail;
    }

    if (normalizedPhone !== undefined) {
      if (normalizedPhone) {
        const existing = await this.userRepository.findOne({ where: { primaryPhone: normalizedPhone } });
        if (existing && existing.id !== userId) {
          throw new BadRequestException('Phone number already in use');
        }
      }
      user.primaryPhone = normalizedPhone;
    }

    if (normalizedFullName !== undefined) user.fullName = normalizedFullName;
    if (normalizedAddress !== undefined) user.address = normalizedAddress;
    if (update.avatarUrl !== undefined) user.avatarUrl = this.normalizeOptionalString(update.avatarUrl);

    await this.userRepository.save(user);
    this.notificationsService
      .notifyActionAlert(userId, 'update', 'profile', {
        userId,
      })
      .catch(() => undefined);
    return this.findById(userId) as Promise<User>;
  }

  private normalizeOptionalString(value?: string): string | null | undefined {
    if (value === undefined) return undefined;
    const trimmed = typeof value === 'string' ? value.trim() : '';
    return trimmed.length > 0 ? trimmed : null;
  }

  async findOrCreateByFirebaseUid(payload: {
    firebaseUid: string;
    phone?: string | null;
    email?: string | null;
    fullName?: string | null;
  }): Promise<User> {
    // Try to find by firebaseUid first
    let user = await this.findByFirebaseUid(payload.firebaseUid);

    // If not found, try by email or phone
    if (!user && payload.email) {
      user = await this.findByEmail(payload.email);
    }
    if (!user && payload.phone) {
      user = await this.findByPhone(payload.phone);
    }

    // Create new user if not found
    if (!user) {
      user = this.userRepository.create({
        firebaseUid: payload.firebaseUid,
        primaryPhone: payload.phone || null,
        primaryEmail: payload.email || null,
        fullName: payload.fullName || null,
        status: 'pending',
        fraudRiskScore: 0,
      });
      user = await this.userRepository.save(user);

      // Assign default 'buyer' role
      const buyerRole = await this.roleRepository.findOne({ where: { code: 'buyer' } });
      if (buyerRole) {
        const userRole = this.userRoleRepository.create({
          userId: user.id,
          roleId: buyerRole.id,
        });
        await this.userRoleRepository.save(userRole);
      }
    } else {
      // Update firebaseUid if missing
      if (!user.firebaseUid) {
        user.firebaseUid = payload.firebaseUid;
        await this.userRepository.save(user);
      }
    }

    // Load roles
    user = await this.findById(user.id);
    return user!;
  }

  async findOrCreateByEmail(payload: {
    email: string;
    fullName?: string | null;
  }): Promise<User> {
    // Try to find by email
    let user = await this.findByEmail(payload.email);

    // Create new user if not found
    if (!user) {
      user = this.userRepository.create({
        primaryEmail: payload.email,
        fullName: payload.fullName || null,
        status: 'pending',
        fraudRiskScore: 0,
      });
      user = await this.userRepository.save(user);

      // Assign default 'buyer' role
      const buyerRole = await this.roleRepository.findOne({ where: { code: 'buyer' } });
      if (buyerRole) {
        const userRole = this.userRoleRepository.create({
          userId: user.id,
          roleId: buyerRole.id,
        });
        await this.userRoleRepository.save(userRole);
      }
    }

    // Load roles
    user = await this.findById(user.id);
    return user!;
  }

  async findOrCreateByPhone(payload: {
    phone: string;
    fullName?: string | null;
  }): Promise<User> {
    // Try to find by phone
    let user = await this.findByPhone(payload.phone);

    // Create new user if not found
    if (!user) {
      user = this.userRepository.create({
        primaryPhone: payload.phone,
        fullName: payload.fullName || null,
        status: 'pending',
        fraudRiskScore: 0,
      });
      user = await this.userRepository.save(user);

      // Assign default 'buyer' role
      const buyerRole = await this.roleRepository.findOne({ where: { code: 'buyer' } });
      if (buyerRole) {
        const userRole = this.userRoleRepository.create({
          userId: user.id,
          roleId: buyerRole.id,
        });
        await this.userRoleRepository.save(userRole);
      }
    }

    // Load roles
    user = await this.findById(user.id);
    return user!;
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userRepository.update(userId, {
      lastLoginAt: new Date(),
    });
  }

  /**
   * Ensure user is active after successful login verification.
   * - Pending users are activated automatically.
   * - Suspended/banned users are blocked.
   */
  async ensureActiveForLogin(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.status === 'pending') {
      user.status = 'active' as any;
      return await this.userRepository.save(user);
    }
    if (user.status !== 'active') {
      // Keep consistent with auth guard expectations
      throw new ForbiddenException(`User status not active: ${user.status}`);
    }
    return user;
  }

  /**
   * Find users by role (e.g., customer_service, admin)
   */
  async findByRole(roleCode: string): Promise<User[]> {
    const role = await this.roleRepository.findOne({ where: { code: roleCode } });
    if (!role) {
      return [];
    }

    const userRoles = await this.userRoleRepository.find({
      where: { roleId: role.id },
      relations: ['user'],
    });

    return userRoles.map((ur) => ur.user).filter((user) => user.status === 'active');
  }
}

