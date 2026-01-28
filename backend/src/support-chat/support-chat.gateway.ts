import { Inject, forwardRef } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayDisconnect } from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { SupportChatService } from './support-chat.service';

@WebSocketGateway({
  namespace: '/support-chat',
  cors: { origin: '*', credentials: true },
})
export class SupportChatGateway implements OnGatewayDisconnect {
  @WebSocketServer() server!: Server;
  private readonly clientRoles = new Map<string, string[]>();
  private readonly supportRoleCounts = new Map<string, number>();

  constructor(
    @Inject(forwardRef(() => SupportChatService))
    private readonly supportChatService: SupportChatService,
  ) {}

  @SubscribeMessage('join')
  handleJoin(client: Socket, payload: { sessionId?: string }) {
    if (payload?.sessionId) {
      client.join(payload.sessionId);
    }
  }

  @SubscribeMessage('leave')
  handleLeave(client: Socket, payload: { sessionId?: string }) {
    if (payload?.sessionId) {
      client.leave(payload.sessionId);
    }
  }

  @SubscribeMessage('presence')
  handlePresence(
    client: Socket,
    payload: { isSupport?: boolean; supportRole?: string; supportRoles?: string[] },
  ) {
    if (!payload?.isSupport) return;
    const roles = payload.supportRoles?.length ? payload.supportRoles : payload.supportRole ? [payload.supportRole] : [];
    this.updateClientRoles(client.id, roles);
  }

  @SubscribeMessage('presence:request')
  handlePresenceRequest(client: Socket) {
    client.emit('presence', { rolesOnline: this.buildRolesOnline() });
  }

  @SubscribeMessage('typing')
  async handleTyping(
    _client: Socket,
    payload: { sessionId?: string; userId?: string; isTyping?: boolean },
  ) {
    if (!payload?.sessionId || !payload.userId) return;
    const session = await this.supportChatService.setTyping(
      payload.sessionId,
      payload.userId,
      !!payload.isTyping,
      false,
    );
    this.emitTyping(payload.sessionId, {
      sessionId: payload.sessionId,
      typingByUserId: session.typingByUserId,
      typingAt: session.typingAt,
    });
  }

  emitMessage(sessionId: string, action: 'created' | 'updated' | 'deleted', message: any) {
    this.server.to(sessionId).emit('message', { action, message });
  }

  emitTyping(sessionId: string, payload: { sessionId: string; typingByUserId: string | null; typingAt: Date | null }) {
    this.server.to(sessionId).emit('typing', payload);
  }

  handleDisconnect(client: Socket) {
    this.updateClientRoles(client.id, []);
  }

  private updateClientRoles(clientId: string, roles: string[]) {
    const previous = this.clientRoles.get(clientId) || [];
    previous.forEach((role) => {
      const next = (this.supportRoleCounts.get(role) || 1) - 1;
      if (next <= 0) {
        this.supportRoleCounts.delete(role);
      } else {
        this.supportRoleCounts.set(role, next);
      }
    });

    if (roles.length === 0) {
      this.clientRoles.delete(clientId);
    } else {
      this.clientRoles.set(clientId, roles);
      roles.forEach((role) => {
        this.supportRoleCounts.set(role, (this.supportRoleCounts.get(role) || 0) + 1);
      });
    }

    this.server.emit('presence', { rolesOnline: this.buildRolesOnline() });
  }

  private buildRolesOnline() {
    const rolesOnline: Record<string, boolean> = {};
    this.supportRoleCounts.forEach((count, role) => {
      rolesOnline[role] = count > 0;
    });
    return rolesOnline;
  }
}
