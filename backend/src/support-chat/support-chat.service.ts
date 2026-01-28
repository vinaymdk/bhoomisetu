import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan, IsNull, Not } from 'typeorm';
import { SupportChatSession, SupportChatRole, SupportChatStatus } from './entities/support-chat-session.entity';
import { SupportChatMessage, SupportMessageType } from './entities/support-chat-message.entity';
import { SupportChatAccess } from './entities/support-chat-access.entity';
import { UsersService } from '../users/users.service';
import { SupportChatGateway } from './support-chat.gateway';

@Injectable()
export class SupportChatService {
  constructor(
    @InjectRepository(SupportChatSession)
    private readonly sessionRepository: Repository<SupportChatSession>,
    @InjectRepository(SupportChatMessage)
    private readonly messageRepository: Repository<SupportChatMessage>,
    @InjectRepository(SupportChatAccess)
    private readonly accessRepository: Repository<SupportChatAccess>,
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => SupportChatGateway))
    private readonly supportChatGateway: SupportChatGateway,
  ) {}

  private isUuid(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    );
  }

  async getAllowedRoles(userId: string): Promise<SupportChatRole[]> {
    const roleCodes = await this.usersService.getUserRoles(userId);
    const allowed = new Set<SupportChatRole>();
    const isSupport = roleCodes.includes('customer_service') || roleCodes.includes('admin');
    const canChatSupport =
      roleCodes.includes('buyer') || roleCodes.includes('seller') || roleCodes.includes('agent') || roleCodes.includes('admin');

    if (canChatSupport) {
      allowed.add(SupportChatRole.CUSTOMER_SERVICE);
    }
    if (isSupport) {
      allowed.add(SupportChatRole.BUYER);
      allowed.add(SupportChatRole.SELLER);
      allowed.add(SupportChatRole.AGENT);
    }

    const accessRows = await this.accessRepository.find({
      where: { userId, isEnabled: true },
    });
    accessRows.forEach((row) => allowed.add(row.supportRole));

    if (isSupport) {
      allowed.delete(SupportChatRole.CUSTOMER_SERVICE);
    }
    return Array.from(allowed);
  }

  async listEligibleUsers(
    currentUserId: string,
    search?: string,
    roleFilter?: SupportChatRole,
  ): Promise<Array<{ id: string; name: string; email?: string | null; role: SupportChatRole; avatarUrl?: string | null }>> {
    const roles = await this.usersService.getUserRoles(currentUserId);
    if (!roles.includes('customer_service') && !roles.includes('admin')) {
      throw new ForbiddenException('Access denied');
    }

    const rolesToFetch: SupportChatRole[] = roleFilter
      ? [roleFilter]
      : [SupportChatRole.BUYER, SupportChatRole.SELLER, SupportChatRole.AGENT];
    const usersByRole = await Promise.all(rolesToFetch.map((role) => this.usersService.findByRole(role)));
    const entries = usersByRole.flatMap((users, index) =>
      users.map((user) => ({
        id: user.id,
        name: user.fullName || 'User',
        email: user.primaryEmail || null,
        role: rolesToFetch[index],
        avatarUrl: user.avatarUrl || null,
      })),
    );

    if (!search) return entries;
    const lowered = search.toLowerCase();
    return entries.filter(
      (entry) =>
        entry.name.toLowerCase().includes(lowered) ||
        (entry.email || '').toLowerCase().includes(lowered),
    );
  }

  async listAccessMappings(currentUserId: string): Promise<Array<Record<string, any>>> {
    const roles = await this.usersService.getUserRoles(currentUserId);
    if (!roles.includes('customer_service') && !roles.includes('admin')) {
      throw new ForbiddenException('Access denied');
    }

    const mappings = await this.accessRepository.find({
      relations: ['user', 'createdBy'],
      order: { createdAt: 'DESC' },
    });
    return mappings.map((mapping) => ({
      id: mapping.id,
      userId: mapping.userId,
      userName: mapping.user?.fullName || 'User',
      userEmail: mapping.user?.primaryEmail || null,
      userAvatarUrl: mapping.user?.avatarUrl || null,
      supportRole: mapping.supportRole,
      isEnabled: mapping.isEnabled,
      createdById: mapping.createdById || null,
      createdByName: mapping.createdBy?.fullName || null,
      createdAt: mapping.createdAt,
      updatedAt: mapping.updatedAt,
    }));
  }

  async setAccessMapping(
    currentUserId: string,
    payload: { userId: string; supportRole: SupportChatRole; isEnabled: boolean },
  ): Promise<Record<string, any>> {
    const roles = await this.usersService.getUserRoles(currentUserId);
    if (!roles.includes('customer_service') && !roles.includes('admin')) {
      throw new ForbiddenException('Access denied');
    }

    let mapping = await this.accessRepository.findOne({
      where: { userId: payload.userId, supportRole: payload.supportRole },
      relations: ['user', 'createdBy'],
    });
    if (!mapping) {
      mapping = this.accessRepository.create({
        userId: payload.userId,
        supportRole: payload.supportRole,
        isEnabled: payload.isEnabled,
        createdById: currentUserId,
      });
    } else {
      mapping.isEnabled = payload.isEnabled;
    }
    const saved = await this.accessRepository.save(mapping);
    const reloaded = await this.accessRepository.findOne({
      where: { id: saved.id },
      relations: ['user', 'createdBy'],
    });
    return {
      id: reloaded?.id,
      userId: reloaded?.userId,
      userName: reloaded?.user?.fullName || 'User',
      userEmail: reloaded?.user?.primaryEmail || null,
      userAvatarUrl: reloaded?.user?.avatarUrl || null,
      supportRole: reloaded?.supportRole,
      isEnabled: reloaded?.isEnabled,
      createdById: reloaded?.createdById || null,
      createdByName: reloaded?.createdBy?.fullName || null,
      createdAt: reloaded?.createdAt,
      updatedAt: reloaded?.updatedAt,
    };
  }

  async listSessions(userId: string): Promise<SupportChatSession[]> {
    return this.sessionRepository.find({
      where: { userId },
      order: { updatedAt: 'DESC' },
    });
  }

  async listAdminSessions(
    adminId: string,
    filters: { status?: SupportChatStatus; supportRole?: SupportChatRole; search?: string } = {},
  ): Promise<Array<Record<string, any>>> {
    const roles = await this.usersService.getUserRoles(adminId);
    if (!roles.includes('customer_service') && !roles.includes('admin')) {
      throw new ForbiddenException('Access denied');
    }

    let query = this.sessionRepository
      .createQueryBuilder('session')
      .leftJoinAndSelect('session.user', 'user')
      .leftJoinAndSelect('session.assignedAgent', 'assignedAgent')
      .orderBy('session.updatedAt', 'DESC');

    if (filters.status) {
      query = query.andWhere('session.status = :status', { status: filters.status });
    }
    if (filters.supportRole) {
      query = query.andWhere('session.supportRole = :supportRole', { supportRole: filters.supportRole });
    }
    if (filters.search) {
      query = query.andWhere('(user.fullName ILIKE :search OR user.primaryEmail ILIKE :search)', {
        search: `%${filters.search}%`,
      });
    }

    const sessions = await query.getMany();
    const sessionIds = sessions.map((session) => session.id);
    const unreadCounts = new Map<string, number>();
    if (sessionIds.length > 0) {
      const rows = await this.messageRepository
        .createQueryBuilder('message')
        .select('message.sessionId', 'sessionId')
        .addSelect('COUNT(message.id)', 'count')
        .where('message.sessionId IN (:...sessionIds)', { sessionIds })
        .andWhere('message.readAt IS NULL')
        .andWhere('message.senderRole = :senderRole', { senderRole: 'user' })
        .groupBy('message.sessionId')
        .getRawMany<{ sessionId: string; count: string }>();
      rows.forEach((row) => {
        unreadCounts.set(row.sessionId, Number(row.count || 0));
      });
    }
    return sessions.map((session) => ({
      id: session.id,
      userId: session.userId,
      userName: session.user?.fullName || 'User',
      userEmail: session.user?.primaryEmail || null,
      userAvatarUrl: session.user?.avatarUrl || null,
      supportRole: session.supportRole,
      status: session.status,
      assignedAgentId: session.assignedAgentId,
      assignedAgentName: session.assignedAgent?.fullName || null,
      lastMessageAt: session.lastMessageAt,
      messageCount: session.messageCount,
      unreadCount: unreadCounts.get(session.id) || 0,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    }));
  }

  async getOrCreateSession(userId: string, supportRole: SupportChatRole): Promise<SupportChatSession> {
    const allowed = await this.getAllowedRoles(userId);
    if (!allowed.includes(supportRole)) {
      throw new ForbiddenException('Support chat access not enabled for this role');
    }
    let session = await this.sessionRepository.findOne({
      where: { userId, supportRole },
    });
    if (!session) {
      session = this.sessionRepository.create({
        userId,
        supportRole,
        status: SupportChatStatus.OPEN,
      });
      session = await this.sessionRepository.save(session);
    }
    return session;
  }

  private mapMessage(message: SupportChatMessage, viewerId: string) {
    const status =
      message.senderId === viewerId
        ? message.readAt
          ? 'read'
          : message.deliveredAt
            ? 'delivered'
            : 'sent'
        : message.readAt
          ? 'read'
          : 'delivered';
    const senderName =
      message.senderId === viewerId
        ? 'You'
        : message.sender?.fullName || 'Support';
    const senderAvatarUrl = message.sender?.avatarUrl || null;
    return {
      id: message.id,
      sessionId: message.sessionId,
      senderId: message.senderId,
      senderRole: message.senderRole,
      senderName,
      senderAvatarUrl,
      messageType: message.messageType,
      content: message.isDeleted ? '' : message.content,
      isDeleted: message.isDeleted,
      isEdited: message.isEdited,
      editedAt: message.editedAt,
      deliveredAt: message.deliveredAt,
      readAt: message.readAt,
      createdAt: message.createdAt,
      status,
    };
  }

  async listMessages(
    sessionId: string,
    userId: string,
    limit: number = 50,
    before?: string,
  ): Promise<any[]> {
    const session = await this.sessionRepository.findOne({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Chat session not found');
    if (session.userId !== userId) {
      const isSupportRole = userId === 'customer_service' || userId === 'admin';
      if (!isSupportRole) {
        if (!this.isUuid(userId)) {
          throw new BadRequestException('Invalid user id');
        }
        const roles = await this.usersService.getUserRoles(userId);
        if (!roles.includes('customer_service') && !roles.includes('admin')) {
          throw new ForbiddenException('Access denied');
        }
      }
    }

    const where: any = { sessionId };
    if (before) {
      where.createdAt = LessThan(new Date(before));
    }

    const messages = await this.messageRepository.find({
      where,
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['sender'],
    });

    const unseen = messages.filter((msg) => msg.senderId !== userId && !msg.readAt);
    if (unseen.length > 0) {
      const readAt = new Date();
      await this.messageRepository.update(unseen.map((msg) => msg.id), { readAt });
      unseen.forEach((message) => {
        const updated = { ...message, readAt };
        this.supportChatGateway.emitMessage(
          sessionId,
          'updated',
          this.mapMessage(updated as SupportChatMessage, userId),
        );
      });
    }

    return messages.reverse().map((message) => this.mapMessage(message, userId));
  }

  async sendMessage(
    sessionId: string,
    userId: string,
    content: string,
    messageType: SupportMessageType = SupportMessageType.TEXT,
  ): Promise<any> {
    const session = await this.sessionRepository.findOne({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Chat session not found');
    if (session.userId !== userId) {
      const roles = await this.usersService.getUserRoles(userId);
      if (!roles.includes('customer_service') && !roles.includes('admin')) {
        throw new ForbiddenException('Access denied');
      }
    }

    const senderRole = session.userId === userId ? 'user' : 'support';
    const message = this.messageRepository.create({
      sessionId,
      senderId: userId,
      senderRole,
      messageType,
      content,
      deliveredAt: new Date(),
    });
    const saved = await this.messageRepository.save(message);
    const savedWithSender = await this.messageRepository.findOne({
      where: { id: saved.id },
      relations: ['sender'],
    });

    session.lastMessageAt = saved.createdAt;
    session.messageCount += 1;
    await this.sessionRepository.save(session);

    const mapped = this.mapMessage(savedWithSender!, userId);
    this.supportChatGateway.emitMessage(sessionId, 'created', mapped);
    return mapped;
  }

  async editMessage(messageId: string, userId: string, content: string): Promise<any> {
    const message = await this.messageRepository.findOne({ where: { id: messageId } });
    if (!message) throw new NotFoundException('Message not found');
    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only edit your own messages');
    }
    if (message.isDeleted) {
      throw new ForbiddenException('Message already deleted');
    }
    message.content = content;
    message.isEdited = true;
    message.editedAt = new Date();
    const saved = await this.messageRepository.save(message);
    const savedWithSender = await this.messageRepository.findOne({
      where: { id: saved.id },
      relations: ['sender'],
    });
    const mapped = this.mapMessage(savedWithSender!, userId);
    this.supportChatGateway.emitMessage(saved.sessionId, 'updated', mapped);
    return mapped;
  }

  async deleteMessage(messageId: string, userId: string): Promise<any> {
    const message = await this.messageRepository.findOne({ where: { id: messageId } });
    if (!message) throw new NotFoundException('Message not found');
    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only delete your own messages');
    }
    message.isDeleted = true;
    message.deletedAt = new Date();
    const saved = await this.messageRepository.save(message);
    const savedWithSender = await this.messageRepository.findOne({
      where: { id: saved.id },
      relations: ['sender'],
    });
    const mapped = this.mapMessage(savedWithSender!, userId);
    this.supportChatGateway.emitMessage(saved.sessionId, 'deleted', mapped);
    return mapped;
  }

  async setTyping(
    sessionId: string,
    userId: string,
    isTyping: boolean,
    emitUpdate: boolean = true,
  ): Promise<SupportChatSession> {
    const session = await this.sessionRepository.findOne({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Chat session not found');
    if (session.userId !== userId) {
      const roles = await this.usersService.getUserRoles(userId);
      if (!roles.includes('customer_service') && !roles.includes('admin')) {
        throw new ForbiddenException('Access denied');
      }
    }
    session.typingByUserId = isTyping ? userId : null;
    session.typingAt = isTyping ? new Date() : null;
    const saved = await this.sessionRepository.save(session);
    if (emitUpdate) {
      this.supportChatGateway.emitTyping(sessionId, {
        sessionId,
        typingByUserId: saved.typingByUserId || null,
        typingAt: saved.typingAt || null,
      });
    }
    return saved;
  }

  async getTyping(sessionId: string): Promise<{ typingByUserId?: string | null; typingAt?: Date | null }> {
    const session = await this.sessionRepository.findOne({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Chat session not found');
    return { typingByUserId: session.typingByUserId, typingAt: session.typingAt };
  }

  async markSessionRead(sessionId: string, userId: string): Promise<{ updated: number }> {
    const session = await this.sessionRepository.findOne({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Chat session not found');
    if (session.userId !== userId) {
      const roles = await this.usersService.getUserRoles(userId);
      if (!roles.includes('customer_service') && !roles.includes('admin')) {
        throw new ForbiddenException('Access denied');
      }
    }

    const unseen = await this.messageRepository.find({
      where: { sessionId, senderId: Not(userId), readAt: IsNull() },
      relations: ['sender'],
    });
    if (unseen.length === 0) return { updated: 0 };
    const readAt = new Date();
    await this.messageRepository.update(unseen.map((msg) => msg.id), { readAt });
    unseen.forEach((message) => {
      const updated = { ...message, readAt };
      this.supportChatGateway.emitMessage(
        sessionId,
        'updated',
        this.mapMessage(updated as SupportChatMessage, userId),
      );
    });
    return { updated: unseen.length };
  }

  async getUnreadCounts(userId: string): Promise<{ total: number; byRole: Record<string, number> }> {
    const roles = await this.usersService.getUserRoles(userId);
    const isSupport = roles.includes('customer_service') || roles.includes('admin');
    let query = this.messageRepository
      .createQueryBuilder('message')
      .innerJoin('message.session', 'session')
      .select('session.supportRole', 'supportRole')
      .addSelect('COUNT(message.id)', 'count')
      .where('message.readAt IS NULL');

    if (isSupport) {
      query = query.andWhere('message.senderRole = :senderRole', { senderRole: 'user' });
    } else {
      query = query
        .andWhere('message.senderRole = :senderRole', { senderRole: 'support' })
        .andWhere('session.userId = :userId', { userId });
    }

    query = query.groupBy('session.supportRole');
    const rows = await query.getRawMany<{ supportRole: string; count: string }>();
    const byRole: Record<string, number> = {};
    let total = 0;
    rows.forEach((row) => {
      const count = Number(row.count || 0);
      byRole[row.supportRole] = count;
      total += count;
    });
    return { total, byRole };
  }

  async getUnreadCount(userId: string): Promise<{ total: number }> {
    const result = await this.getUnreadCounts(userId);
    return { total: result.total };
  }
}
