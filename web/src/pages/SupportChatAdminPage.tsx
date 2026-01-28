import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supportChatAdminService } from '../services/supportChatAdmin.service';
import { supportChatService } from '../services/supportChat.service';
import { createSupportChatSocket } from '../services/supportChatSocket';
import type {
  SupportChatAccessMapping,
  SupportChatAccessUser,
  SupportChatAdminSession,
  SupportChatMessage,
  SupportChatRole,
} from '../types/supportChat';
import './SupportChatAdminPage.css';

const formatTime = (iso: string) => {
  const date = new Date(iso);
  return date.toLocaleString();
};

export const SupportChatAdminPage = () => {
  const { user } = useAuth();
  const currentUserId = user?.id;
  const [sessions, setSessions] = useState<SupportChatAdminSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<SupportChatAdminSession | null>(null);
  const [messages, setMessages] = useState<SupportChatMessage[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [supportRole, setSupportRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [isRemoteTyping, setIsRemoteTyping] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [accessMappings, setAccessMappings] = useState<SupportChatAccessMapping[]>([]);
  const [accessUsers, setAccessUsers] = useState<SupportChatAccessUser[]>([]);
  const [accessUsersRaw, setAccessUsersRaw] = useState<SupportChatAccessUser[]>([]);
  const [accessSearch, setAccessSearch] = useState('');
  const [accessRole, setAccessRole] = useState<SupportChatRole | ''>('');
  const [selectedAccessUserId, setSelectedAccessUserId] = useState('');
  const [selectedAccessRole, setSelectedAccessRole] = useState<SupportChatRole>('buyer');
  const [accessEnabled, setAccessEnabled] = useState(true);
  const [accessLoading, setAccessLoading] = useState(false);
  const [savingAccess, setSavingAccess] = useState(false);
  const [showAccessDropdown, setShowAccessDropdown] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const socketRef = useRef<ReturnType<typeof createSupportChatSocket> | null>(null);

  const activeSessionId = selectedSession?.id;

  const loadSessions = async () => {
    setLoading(true);
    const data = await supportChatAdminService.listSessions({
      search: search || undefined,
      status: status || undefined,
      supportRole: supportRole || undefined,
    });
    const grouped = new Map<string, SupportChatAdminSession>();
    data.forEach((session) => {
      const existing = grouped.get(session.userId);
      if (!existing) {
        grouped.set(session.userId, session);
        return;
      }
      const existingTime = existing.lastMessageAt ? new Date(existing.lastMessageAt).getTime() : 0;
      const nextTime = session.lastMessageAt ? new Date(session.lastMessageAt).getTime() : 0;
      const mergedUnread = (existing.unreadCount || 0) + (session.unreadCount || 0);
      if (nextTime >= existingTime) {
        grouped.set(session.userId, { ...session, unreadCount: mergedUnread });
      } else {
        grouped.set(session.userId, { ...existing, unreadCount: mergedUnread });
      }
    });
    setSessions(Array.from(grouped.values()));
    setLoading(false);
  };

  const loadAccessMappings = async () => {
    const data = await supportChatAdminService.listAccessMappings();
    setAccessMappings(data);
  };

  const loadAccessUsers = async () => {
    setAccessLoading(true);
    const data = await supportChatAdminService.listEligibleUsers({
      search: accessSearch || undefined,
      supportRole: accessRole || undefined,
    });
    setAccessUsersRaw(data);
    const unique = new Map<string, SupportChatAccessUser>();
    data.forEach((entry) => {
      if (!unique.has(entry.id)) {
        unique.set(entry.id, entry);
      }
    });
    const list = Array.from(unique.values());
    setAccessUsers(list);
    if (!selectedAccessUserId && list.length > 0) {
      setSelectedAccessUserId(list[0].id);
    }
    setAccessLoading(false);
  };

  const loadMessages = async (sessionId: string) => {
    setChatLoading(true);
    const data = await supportChatService.listMessages(sessionId, 50);
    setMessages(data);
    await supportChatService.markSessionRead(sessionId);
    setSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId ? { ...session, unreadCount: 0 } : session,
      ),
    );
    setChatLoading(false);
    setTimeout(() => scrollToBottom('auto'), 0);
  };

  useEffect(() => {
    loadSessions().catch(() => undefined);
    loadAccessMappings().catch(() => undefined);
    loadAccessUsers().catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadAccessUsers().catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessSearch, accessRole]);

  useEffect(() => {
    if (!activeSessionId) return;
    loadMessages(activeSessionId).catch(() => undefined);
  }, [activeSessionId]);

  useEffect(() => {
    const socket = createSupportChatSocket();
    socketRef.current = socket;
    socket.on('connect', () => {
      socket.emit('presence:request');
      socket.emit('presence', {
        isSupport: true,
        supportRoles: ['customer_service', 'buyer', 'seller', 'agent'],
      });
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !activeSessionId) return;
    socket.emit('join', { sessionId: activeSessionId });
    return () => {
      socket.emit('leave', { sessionId: activeSessionId });
    };
  }, [activeSessionId]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    const handleMessage = (payload: { action: string; message: SupportChatMessage }) => {
      const { message } = payload;
      if (message.sessionId !== activeSessionId) {
        setSessions((prev) =>
          prev.map((session) =>
            session.id === message.sessionId
              ? { ...session, lastMessageAt: message.createdAt, unreadCount: (session.unreadCount || 0) + 1 }
              : session,
          ),
        );
        return;
      }
      setMessages((prev) => {
        const exists = prev.some((item) => item.id === message.id);
        if (exists) {
          return prev.map((item) => (item.id === message.id ? message : item));
        }
        const sendingIndex =
          message.senderId === currentUserId
            ? prev.findIndex((item) => item.status === 'sending' && item.content === message.content)
            : -1;
        if (sendingIndex >= 0) {
          return prev.map((item, idx) => (idx === sendingIndex ? message : item));
        }
        return [...prev, message].slice(-200);
      });
      if (message.senderId !== currentUserId && (isAtBottom() || isInputFocused)) {
        supportChatService.markSessionRead(message.sessionId).catch(() => undefined);
        setSessions((prev) =>
          prev.map((session) =>
            session.id === message.sessionId ? { ...session, unreadCount: 0 } : session,
          ),
        );
        setTimeout(() => scrollToBottom('smooth'), 0);
      }
    };
    const handleTyping = (payload: { sessionId: string; typingByUserId?: string | null; typingAt?: string | null }) => {
      if (payload.sessionId !== activeSessionId) return;
      const typingAt = payload.typingAt ? new Date(payload.typingAt).getTime() : 0;
      const isRemote = !!payload.typingByUserId && payload.typingByUserId !== currentUserId;
      setIsRemoteTyping(isRemote && Date.now() - typingAt < 6000);
    };
    socket.on('message', handleMessage);
    socket.on('typing', handleTyping);
    return () => {
      socket.off('message', handleMessage);
      socket.off('typing', handleTyping);
    };
  }, [activeSessionId, currentUserId]);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (!messagesRef.current) return;
    messagesRef.current.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior,
    });
  };

  const isAtBottom = () => {
    if (!messagesRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = messagesRef.current;
    return scrollTop + clientHeight >= scrollHeight - 24;
  };

  const handleMessagesScroll = () => {
    if (!messagesRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesRef.current;
    const atBottom = scrollTop + clientHeight >= scrollHeight - 24;
    setShowScrollDown(!atBottom);
  };

  useEffect(() => {
    if (!messagesRef.current) return;
    const target = messagesRef.current;
    target.addEventListener('scroll', handleMessagesScroll);
    return () => target.removeEventListener('scroll', handleMessagesScroll);
  }, []);

  const scheduleTyping = () => {
    if (!activeSessionId || !currentUserId) return;
    const socket = socketRef.current;
    if (socket) {
      socket.emit('typing', { sessionId: activeSessionId, userId: currentUserId, isTyping: true });
    } else {
      supportChatService.setTyping(activeSessionId, true).catch(() => undefined);
    }
    if (typingTimerRef.current) window.clearTimeout(typingTimerRef.current);
    typingTimerRef.current = window.setTimeout(() => {
      if (socket) {
        socket.emit('typing', { sessionId: activeSessionId, userId: currentUserId, isTyping: false });
      } else {
        supportChatService.setTyping(activeSessionId, false).catch(() => undefined);
      }
    }, 1500);
  };

  const handleSend = async () => {
    if (!activeSessionId || isSending) return;
    const trimmed = chatInput.trim();
    if (!trimmed) return;
    setIsSending(true);
    const tempId = `temp-${Date.now()}`;
    const optimistic: SupportChatMessage = {
      id: tempId,
      sessionId: activeSessionId,
      senderId: currentUserId || 'me',
      senderRole: 'support',
      senderName: user?.fullName || 'You',
      senderAvatarUrl: user?.avatarUrl || null,
      messageType: 'text',
      content: trimmed,
      isDeleted: false,
      isEdited: false,
      createdAt: new Date().toISOString(),
      status: 'sending',
    };
    setMessages((prev) => [...prev, optimistic].slice(-200));
    setChatInput('');
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.focus();
    }
    scrollToBottom('smooth');
    try {
      await supportChatService.sendMessage(activeSessionId, trimmed);
    } catch {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === tempId ? { ...msg, status: 'failed' } : msg)),
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleEdit = (message: SupportChatMessage) => {
    setEditingMessageId(message.id);
    setEditingText(message.content);
  };

  const handleEditSave = async () => {
    if (!editingMessageId) return;
    const saved = await supportChatService.editMessage(editingMessageId, editingText);
    setMessages((prev) => prev.map((msg) => (msg.id === editingMessageId ? saved : msg)));
    setEditingMessageId(null);
    setEditingText('');
  };

  const handleDelete = async (message: SupportChatMessage) => {
    const saved = await supportChatService.deleteMessage(message.id);
    setMessages((prev) => prev.map((msg) => (msg.id === message.id ? saved : msg)));
  };

  const handleAccessSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedAccessUserId) return;
    setSavingAccess(true);
    try {
      const saved = await supportChatAdminService.setAccessMapping({
        userId: selectedAccessUserId,
        supportRole: selectedAccessRole,
        isEnabled: accessEnabled,
      });
      setAccessMappings((prev) => {
        const exists = prev.some((mapping) => mapping.id === saved.id);
        if (exists) {
          return prev.map((mapping) => (mapping.id === saved.id ? saved : mapping));
        }
        return [saved, ...prev];
      });
    } finally {
      setSavingAccess(false);
    }
  };

  const handleAccessToggle = async (mapping: SupportChatAccessMapping) => {
    setSavingAccess(true);
    try {
      const saved = await supportChatAdminService.setAccessMapping({
        userId: mapping.userId,
        supportRole: mapping.supportRole,
        isEnabled: !mapping.isEnabled,
      });
      setAccessMappings((prev) =>
        prev.map((entry) => (entry.id === mapping.id ? saved : entry)),
      );
    } finally {
      setSavingAccess(false);
    }
  };

  const handleBulkAccess = async (roles: SupportChatRole[], enabled: boolean) => {
    if (!selectedAccessUserId) return;
    setSavingAccess(true);
    try {
      const results = [];
      for (const role of roles) {
        const saved = await supportChatAdminService.setAccessMapping({
          userId: selectedAccessUserId,
          supportRole: role,
          isEnabled: enabled,
        });
        results.push(saved);
      }
      setAccessMappings((prev) => {
        const next = [...prev];
        results.forEach((saved) => {
          const index = next.findIndex((entry) => entry.id === saved.id);
          if (index >= 0) {
            next[index] = saved;
          } else {
            next.unshift(saved);
          }
        });
        return next;
      });
    } finally {
      setSavingAccess(false);
    }
  };

  const handleBulkApprove = async (role: SupportChatRole) => {
    const targets = accessUsersRaw.filter((user) => user.role === role);
    if (targets.length === 0) return;
    setSavingAccess(true);
    try {
      const results = await Promise.all(
        targets.map((user) =>
          supportChatAdminService.setAccessMapping({
            userId: user.id,
            supportRole: role,
            isEnabled: true,
          }),
        ),
      );
      setAccessMappings((prev) => {
        const next = [...prev];
        results.forEach((saved) => {
          const index = next.findIndex((entry) => entry.id === saved.id);
          if (index >= 0) {
            next[index] = saved;
          } else {
            next.unshift(saved);
          }
        });
        return next;
      });
    } finally {
      setSavingAccess(false);
    }
  };

  const renderMessages = () => {
    const nodes: JSX.Element[] = [];
    let lastDate = '';
    messages.forEach((msg) => {
      const date = new Date(msg.createdAt);
      const dateKey = date.toDateString();
      if (dateKey !== lastDate) {
        nodes.push(
          <div key={`date-${msg.id}`} className="support-chat-separator">
            {date.toLocaleDateString()}
          </div>,
        );
        lastDate = dateKey;
      }
      const isEditing = editingMessageId === msg.id;
      const isSupport = msg.senderRole === 'support';
      const isDeleted = msg.isDeleted;
      nodes.push(
        <div key={msg.id} className={`support-chat-row ${isSupport ? 'support' : 'user'}`}>
          <div className="support-chat-avatar">
            {msg.senderAvatarUrl ? (
              <img src={msg.senderAvatarUrl} alt={msg.senderName || 'User'} />
            ) : (
              (msg.senderName || 'U').slice(0, 1)
            )}
          </div>
          <div className={`support-chat-bubble ${isSupport ? 'support' : 'user'} ${isDeleted ? 'deleted' : ''}`}>
            {isEditing ? (
              <div className="support-chat-edit">
                <textarea value={editingText} onChange={(e) => setEditingText(e.target.value)} />
                <div className="support-chat-edit-actions">
                  <button onClick={handleEditSave}>Save</button>
                  <button onClick={() => setEditingMessageId(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <span className={isDeleted ? 'support-chat-deleted-text' : undefined}>
                {isDeleted ? 'This message was deleted' : msg.content}
              </span>
            )}
            <div className="support-chat-meta">
              <small>{formatTime(msg.createdAt)}</small>
              {msg.isEdited && <span className="support-chat-edited">Edited</span>}
            </div>
            {isSupport && !msg.isDeleted && (
              <div className="support-chat-actions">
                <button onClick={() => handleEdit(msg)}>Edit</button>
                <button onClick={() => handleDelete(msg)}>Delete</button>
              </div>
            )}
          </div>
        </div>,
      );
    });
    return nodes;
  };

  const supportRoleLabel = useMemo(() => {
    const role = selectedSession?.supportRole as SupportChatRole | undefined;
    if (!role) return 'Support';
    return role.replace('_', ' ').toUpperCase();
  }, [selectedSession?.supportRole]);

  return (
    <div className="support-chat-admin-page">
      <div className="support-chat-admin-header">
        <div>
          <h1>Support Chat Dashboard</h1>
          <p>Respond to customer support conversations in real time.</p>
        </div>
        <button className="support-chat-refresh" onClick={loadSessions} disabled={loading}>
          Refresh
        </button>
      </div>

      <div className="support-chat-admin-filters">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search user name or email"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All status</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </select>
        <select value={supportRole} onChange={(e) => setSupportRole(e.target.value)}>
          <option value="">All roles</option>
          <option value="customer_service">Customer Service</option>
          <option value="buyer">Buyer</option>
          <option value="seller">Seller</option>
          <option value="agent">Agent</option>
        </select>
        <button onClick={loadSessions} disabled={loading}>
          Apply
        </button>
      </div>

      <div className="support-chat-admin-grid">
        <aside className="support-chat-session-list">
          {loading && <div className="support-chat-state">Loading sessions...</div>}
          {!loading && sessions.length === 0 && (
            <div className="support-chat-state">No sessions found.</div>
          )}
          {sessions.map((session) => (
            <button
              key={session.id}
              className={`support-chat-session ${session.id === activeSessionId ? 'active' : ''}`}
              onClick={() => setSelectedSession(session)}
            >
              <div className="support-chat-session-title">
                <div className="support-chat-avatar">
                  {session.userAvatarUrl ? (
                    <img src={session.userAvatarUrl} alt={session.userName} />
                  ) : (
                    session.userName.slice(0, 1)
                  )}
                </div>
                <div>
                  <strong>{session.userName}</strong>
                  <span>{session.supportRole.replace('_', ' ')}</span>
                </div>
                {session.unreadCount ? (
                  <span className="support-chat-badge">{session.unreadCount}</span>
                ) : null}
              </div>
              <div className="support-chat-session-meta">
                <span>{session.userEmail || 'No email'}</span>
                <span>{session.lastMessageAt ? formatTime(session.lastMessageAt) : 'No messages'}</span>
              </div>
            </button>
          ))}
        </aside>

        <section className="support-chat-panel">
          <div className="support-chat-panel-header">
            <div>
              <h2>{selectedSession?.userName || 'Select a session'}</h2>
              <p>{supportRoleLabel} • {selectedSession?.userEmail || 'No email'}</p>
            </div>
            <span className={`support-chat-status ${selectedSession?.status || ''}`}>
              {selectedSession?.status || 'open'}
            </span>
          </div>

          <div className="support-chat-messages" ref={messagesRef}>
            {!selectedSession && <div className="support-chat-state">Select a conversation to start.</div>}
            {selectedSession &&
              (chatLoading ? <div className="support-chat-state">Loading messages...</div> : renderMessages())}
            {isRemoteTyping && (
              <div className="support-chat-row user">
                <div className="support-chat-avatar">U</div>
                <div className="support-chat-bubble user typing">
                  <span className="typing-dots" />
                  <small>User is typing...</small>
                </div>
              </div>
            )}
          </div>
          {showScrollDown && (
            <button className="support-chat-scroll" onClick={() => scrollToBottom()}>
              Scroll to latest
            </button>
          )}
          <div className="support-chat-input">
            <textarea
              ref={inputRef}
              value={chatInput}
              placeholder="Type your reply..."
              disabled={!selectedSession}
              onChange={(event) => {
                setChatInput(event.target.value);
                event.currentTarget.style.height = 'auto';
                event.currentTarget.style.height = `${event.currentTarget.scrollHeight}px`;
                scheduleTyping();
              }}
              onFocus={() => {
                setIsInputFocused(true);
                if (activeSessionId) {
                  supportChatService.markSessionRead(activeSessionId).catch(() => undefined);
                }
              }}
              onBlur={() => setIsInputFocused(false)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  handleSend();
                }
              }}
              rows={1}
            />
            <button onClick={handleSend} aria-label="Send reply" disabled={!selectedSession || isSending}>
              <i className="fa fa-paper-plane" aria-hidden="true" />
            </button>
          </div>
        </section>
      </div>

      <section className="support-chat-access">
        <div className="support-chat-access-header">
          <h3>Chat Access Approvals</h3>
          <p>Enable or disable chat roles for approved users.</p>
        </div>
        <div className="support-chat-access-bulk">
          <button type="button" onClick={() => handleBulkApprove('buyer')} disabled={savingAccess}>
            Enable all Buyers
          </button>
          <button type="button" onClick={() => handleBulkApprove('seller')} disabled={savingAccess}>
            Enable all Sellers
          </button>
          <button type="button" onClick={() => handleBulkApprove('agent')} disabled={savingAccess}>
            Enable all Agents
          </button>
        </div>
        <form className="support-chat-access-form" onSubmit={handleAccessSubmit}>
          <input
            value={accessSearch}
            onChange={(event) => setAccessSearch(event.target.value)}
            placeholder="Search user by name or email"
          />
          <select
            value={accessRole}
            onChange={(event) => setAccessRole(event.target.value as SupportChatRole | '')}
          >
            <option value="">All roles</option>
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
            <option value="agent">Agent</option>
          </select>
          <div className="support-chat-access-picker">
            <button
              type="button"
              onClick={() => setShowAccessDropdown((prev) => !prev)}
              className="support-chat-access-trigger"
            >
              {accessUsers.find((entry) => entry.id === selectedAccessUserId)?.name || 'Select user'}
            </button>
            {showAccessDropdown && (
              <div className="support-chat-access-dropdown">
                {accessUsers.map((entry) => (
                  <button
                    key={`${entry.id}-${entry.role}`}
                    type="button"
                    className="support-chat-access-option"
                    onClick={() => {
                      setSelectedAccessUserId(entry.id);
                      setShowAccessDropdown(false);
                    }}
                  >
                    <span className="support-chat-avatar">
                      {entry.avatarUrl ? <img src={entry.avatarUrl} alt={entry.name} /> : entry.name.slice(0, 1)}
                    </span>
                    <span>
                      <strong>{entry.name}</strong>
                      <small>{entry.email || 'No email'} • {entry.role}</small>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <select
            value={selectedAccessRole}
            onChange={(event) => setSelectedAccessRole(event.target.value as SupportChatRole)}
          >
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
            <option value="agent">Agent</option>
            <option value="customer_service">Customer Service</option>
          </select>
          <label className="support-chat-access-toggle">
            <input
              type="checkbox"
              checked={accessEnabled}
              onChange={(event) => setAccessEnabled(event.target.checked)}
            />
            Enable access
          </label>
          <button type="submit" disabled={accessLoading || savingAccess || !selectedAccessUserId}>
            Save
          </button>
        </form>

        <div className="support-chat-access-list">
          {accessMappings.length === 0 && (
            <div className="support-chat-state">No access mappings yet.</div>
          )}
          {accessMappings.map((mapping) => (
            <div key={mapping.id} className={`support-chat-access-item ${mapping.isEnabled ? 'enabled' : 'disabled'}`}>
              <div className="support-chat-access-user">
                <div className="support-chat-avatar">
                  {mapping.userAvatarUrl ? (
                    <img src={mapping.userAvatarUrl} alt={mapping.userName} />
                  ) : (
                    mapping.userName.slice(0, 1)
                  )}
                </div>
                <div>
                  <strong>{mapping.userName}</strong>
                  <span>{mapping.userEmail || 'No email'}</span>
                </div>
              </div>
              <div className="support-chat-access-meta">
                <span>{mapping.supportRole.replace('_', ' ')}</span>
                <span className={`support-chat-access-status ${mapping.isEnabled ? 'on' : 'off'}`}>
                  {mapping.isEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <button type="button" onClick={() => handleAccessToggle(mapping)}>
                {mapping.isEnabled ? 'Disable' : 'Enable'}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
