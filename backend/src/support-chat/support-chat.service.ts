import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan } from 'typeorm';
import { SupportChatSession, SupportChatRole, SupportChatStatus } from './entities/support-chat-session.entity';
import { SupportChatMessage, SupportMessageType } from './entities/support-chat-message.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class SupportChatService {
  constructor(
    @InjectRepository(SupportChatSession)
    private readonly sessionRepository: Repository<SupportChatSession>,
    @InjectRepository(SupportChatMessage)
    private readonly messageRepository: Repository<SupportChatMessage>,
    private readonly usersService: UsersService,
  ) {}

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
    return sessions.map((session) => ({
      id: session.id,
      userId: session.userId,
      userName: session.user?.fullName || 'User',
      userEmail: session.user?.primaryEmail || null,
      supportRole: session.supportRole,
      status: session.status,
      assignedAgentId: session.assignedAgentId,
      assignedAgentName: session.assignedAgent?.fullName || null,
      lastMessageAt: session.lastMessageAt,
      messageCount: session.messageCount,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    }));
  }

  async getOrCreateSession(userId: string, supportRole: SupportChatRole): Promise<SupportChatSession> {
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
    return {
      id: message.id,
      sessionId: message.sessionId,
      senderId: message.senderId,
      senderRole: message.senderRole,
      senderName,
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
      const roles = await this.usersService.getUserRoles(userId);
      if (!roles.includes('customer_service') && !roles.includes('admin')) {
        throw new ForbiddenException('Access denied');
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

    const unseen = messages.filter(
      (msg) => msg.senderId !== userId && !msg.readAt,
    );
    if (unseen.length > 0) {
      await this.messageRepository.update(
        unseen.map((msg) => msg.id),
        { readAt: new Date() },
      );
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

    return this.mapMessage(savedWithSender!, userId);
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
    return this.mapMessage(savedWithSender!, userId);
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
    return this.mapMessage(savedWithSender!, userId);
  }

  async setTyping(sessionId: string, userId: string, isTyping: boolean): Promise<SupportChatSession> {
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
    return this.sessionRepository.save(session);
  }

  async getTyping(sessionId: string): Promise<{ typingByUserId?: string | null; typingAt?: Date | null }> {
    const session = await this.sessionRepository.findOne({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Chat session not found');
    return { typingByUserId: session.typingByUserId, typingAt: session.typingAt };
  }
}
