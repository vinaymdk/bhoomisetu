import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { notificationsService } from '../services/notifications.service';
import type { NotificationItem } from '../types/notification';
import { supportChatService } from '../services/supportChat.service';
import type { SupportChatMessage, SupportChatRole, SupportChatSession } from '../types/supportChat';
import './NotificationsPage.css';

const resolveMessage = (notification: NotificationItem) => {
  const lang = navigator.language?.toLowerCase() || 'en';
  if (lang.startsWith('te') && notification.messageTelugu) {
    return notification.messageTelugu;
  }
  if (lang.startsWith('en') && notification.messageEnglish) {
    return notification.messageEnglish;
  }
  return notification.message;
};

const formatTime = (iso: string) => {
  const date = new Date(iso);
  return date.toLocaleString();
};

export const NotificationsPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedUserId, setSelectedUserId] = useState<SupportChatRole>('customer_service');
  const [activeSession, setActiveSession] = useState<SupportChatSession | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Record<string, SupportChatMessage[]>>({});
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [isRemoteTyping, setIsRemoteTyping] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [isLoadingEarlier, setIsLoadingEarlier] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const usersRef = useRef<HTMLDivElement | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeCount = useMemo(
    () => notifications.filter((item) => !item.readAt).length,
    [notifications],
  );

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationsService.list({ unreadOnly });
      setNotifications(response.notifications);
      setUnreadCount(response.unreadCount);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [unreadOnly]);

  const handleMarkAllRead = async () => {
    await notificationsService.markAllRead();
    loadNotifications();
  };

  const handleMarkRead = async (item: NotificationItem) => {
    if (item.readAt) return;
    await notificationsService.markRead(item.id);
    setNotifications((prev) =>
      prev.map((current) =>
        current.id === item.id ? { ...current, readAt: new Date().toISOString(), status: 'read' } : current,
      ),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const enabledUsers = [
    { id: 'customer_service' as SupportChatRole, name: 'Customer Service', role: 'customer_service', enabled: true },
    { id: 'buyer' as SupportChatRole, name: 'Buyer Support', role: 'buyer', enabled: true },
    { id: 'seller' as SupportChatRole, name: 'Seller Support', role: 'seller', enabled: true },
    { id: 'agent' as SupportChatRole, name: 'Agent Support', role: 'agent', enabled: true },
  ];

  const activeChat = activeSession ? chatMessages[activeSession.id] || [] : [];

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (!messagesRef.current) return;
    messagesRef.current.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior,
    });
  };

  const loadSession = async (role: SupportChatRole) => {
    const session = await supportChatService.getOrCreateSession(role);
    setActiveSession(session);
    if (!chatMessages[session.id]) {
      const messages = await supportChatService.listMessages(session.id, 50);
      setChatMessages((prev) => ({ ...prev, [session.id]: messages }));
    }
    setIsRemoteTyping(false);
    setTimeout(() => scrollToBottom('auto'), 0);
  };

  useEffect(() => {
    loadSession(selectedUserId).catch(() => undefined);
  }, [selectedUserId]);

  useEffect(() => {
    if (!activeSession) return;
    inputRef.current?.focus();
  }, [activeSession?.id]);

  const handleSendChat = async () => {
    if (!activeSession) return;
    const trimmed = chatInput.trim();
    if (!trimmed) return;
    const sessionId = activeSession.id;
    const tempId = `temp-${Date.now()}`;
    const optimistic: SupportChatMessage = {
      id: tempId,
      sessionId,
      senderId: user?.id || 'me',
      senderRole: 'user',
      senderName: user?.fullName || 'You',
      messageType: 'text',
      content: trimmed,
      isDeleted: false,
      isEdited: false,
      createdAt: new Date().toISOString(),
      status: 'sent',
    };
    setChatMessages((prev) => ({
      ...prev,
      [sessionId]: [...(prev[sessionId] || []), optimistic],
    }));
    setChatInput('');
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
    inputRef.current?.focus();
    scrollToBottom('smooth');

    try {
      const saved = await supportChatService.sendMessage(sessionId, trimmed);
      setChatMessages((prev) => ({
        ...prev,
        [sessionId]: (prev[sessionId] || []).map((msg) => (msg.id === tempId ? saved : msg)),
      }));
    } catch {
      setChatMessages((prev) => ({
        ...prev,
        [sessionId]: (prev[sessionId] || []).map((msg) =>
          msg.id === tempId ? { ...msg, status: 'failed' } : msg,
        ),
      }));
    }
  };

  const handleRetry = async (messageId: string) => {
    if (!activeSession) return;
    const message = activeChat.find((msg) => msg.id === messageId);
    if (!message) return;
    setChatMessages((prev) => ({
      ...prev,
      [activeSession.id]: (prev[activeSession.id] || []).map((msg) =>
        msg.id === messageId ? { ...msg, status: 'sent' } : msg,
      ),
    }));
    try {
      const saved = await supportChatService.sendMessage(activeSession.id, message.content);
      setChatMessages((prev) => ({
        ...prev,
        [activeSession.id]: (prev[activeSession.id] || []).map((msg) =>
          msg.id === messageId ? saved : msg,
        ),
      }));
    } catch {
      setChatMessages((prev) => ({
        ...prev,
        [activeSession.id]: (prev[activeSession.id] || []).map((msg) =>
          msg.id === messageId ? { ...msg, status: 'failed' } : msg,
        ),
      }));
    }
  };

  const handleMessagesScroll = () => {
    if (!messagesRef.current || !activeSession) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesRef.current;
    const atBottom = scrollTop + clientHeight >= scrollHeight - 24;
    setShowScrollDown(!atBottom);
    if (scrollTop <= 4 && !isLoadingEarlier && activeChat.length > 0) {
      setIsLoadingEarlier(true);
      supportChatService
        .listMessages(activeSession.id, 30, activeChat[0].createdAt)
        .then((older) => {
          setChatMessages((prev) => ({
            ...prev,
            [activeSession.id]: [...older, ...(prev[activeSession.id] || [])].slice(-200),
          }));
        })
        .finally(() => setIsLoadingEarlier(false));
    }
  };

  useEffect(() => {
    if (!messagesRef.current) return;
    const handleScroll = () => handleMessagesScroll();
    const target = messagesRef.current;
    target.addEventListener('scroll', handleScroll);
    return () => target.removeEventListener('scroll', handleScroll);
  }, [activeSession?.id, isLoadingEarlier, activeChat.length]);

  useEffect(() => {
    if (!activeSession) return;
    const interval = window.setInterval(async () => {
      const [messages, typing] = await Promise.all([
        supportChatService.listMessages(activeSession.id, 50),
        supportChatService.getTyping(activeSession.id),
      ]);
      setChatMessages((prev) => ({ ...prev, [activeSession.id]: messages }));
      const typingAt = typing.typingAt ? new Date(typing.typingAt).getTime() : 0;
      const typingActive =
        !!typing.typingByUserId &&
        typing.typingByUserId !== user?.id &&
        Date.now() - typingAt < 6000;
      setIsRemoteTyping(typingActive);
    }, 4000);
    return () => window.clearInterval(interval);
  }, [activeSession?.id, user?.id]);

  useEffect(() => {
    if (!messagesRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesRef.current;
    const atBottom = scrollTop + clientHeight >= scrollHeight - 24;
    if (atBottom) {
      scrollToBottom('smooth');
    } else {
      setShowScrollDown(true);
    }
  }, [activeChat.length, isRemoteTyping]);

  const scheduleTyping = () => {
    if (!activeSession) return;
    supportChatService.setTyping(activeSession.id, true).catch(() => undefined);
    if (typingTimerRef.current) window.clearTimeout(typingTimerRef.current);
    typingTimerRef.current = window.setTimeout(() => {
      supportChatService.setTyping(activeSession.id, false).catch(() => undefined);
    }, 1500);
  };

  const handleEdit = (message: SupportChatMessage) => {
    setEditingMessageId(message.id);
    setEditingText(message.content);
  };

  const handleEditSave = async () => {
    if (!activeSession || !editingMessageId) return;
    const saved = await supportChatService.editMessage(editingMessageId, editingText);
    setChatMessages((prev) => ({
      ...prev,
      [activeSession.id]: (prev[activeSession.id] || []).map((msg) =>
        msg.id === editingMessageId ? saved : msg,
      ),
    }));
    setEditingMessageId(null);
    setEditingText('');
  };

  const handleDelete = async (message: SupportChatMessage) => {
    if (!activeSession) return;
    const saved = await supportChatService.deleteMessage(message.id);
    setChatMessages((prev) => ({
      ...prev,
      [activeSession.id]: (prev[activeSession.id] || []).map((msg) =>
        msg.id === message.id ? saved : msg,
      ),
    }));
  };

  const renderStatusIcon = (status: SupportChatMessage['status']) => {
    if (status === 'read') {
      return <i className="fa fa-check-double status-read" aria-hidden="true" />;
    }
    if (status === 'delivered') {
      return <i className="fa fa-check-double status-delivered" aria-hidden="true" />;
    }
    if (status === 'failed') {
      return <i className="fa fa-exclamation-circle status-failed" aria-hidden="true" />;
    }
    return <i className="fa fa-check status-sent" aria-hidden="true" />;
  };

  const renderMessages = () => {
    const nodes: Array<JSX.Element> = [];
    let lastDate = '';
    let lastTime = 0;
    activeChat.forEach((msg, index) => {
      const date = new Date(msg.createdAt);
      const dateKey = date.toDateString();
      const timeGap = Math.abs(date.getTime() - lastTime);
      if (dateKey !== lastDate) {
        nodes.push(
          <div key={`date-${msg.id}`} className="notifications-chat-separator">
            {date.toLocaleDateString()}
          </div>,
        );
        lastDate = dateKey;
        lastTime = date.getTime();
      } else if (timeGap > 5 * 60 * 1000) {
        nodes.push(
          <div key={`time-${msg.id}`} className="notifications-chat-separator time">
            {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>,
        );
        lastTime = date.getTime();
      }

      const isUser = msg.senderRole === 'user';
      const showActions = isUser && !msg.isDeleted;
      const isEditing = editingMessageId === msg.id;
      nodes.push(
        <div key={msg.id} className={`notifications-chat-row ${isUser ? 'user' : 'support'}`}>
          <div className="notifications-chat-avatar">
            {(msg.senderName || (isUser ? 'You' : 'Support')).slice(0, 1)}
          </div>
          <div className={`notifications-chat-bubble ${isUser ? 'user' : 'support'}`}>
            {isEditing ? (
              <div className="notifications-chat-edit">
                <textarea
                  value={editingText}
                  onChange={(event) => setEditingText(event.target.value)}
                />
                <div className="notifications-chat-edit-actions">
                  <button type="button" onClick={handleEditSave}>
                    Save
                  </button>
                  <button type="button" onClick={() => setEditingMessageId(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <span>{msg.isDeleted ? 'Message deleted' : msg.content}</span>
            )}
            <div className="notifications-chat-meta">
              <small className="chat-time">{formatTime(msg.createdAt)}</small>
              {isUser && (
                <span className="notifications-chat-status">
                  {renderStatusIcon(msg.status)}
                </span>
              )}
              {isUser && msg.status === 'failed' && (
                <button
                  type="button"
                  className="notifications-chat-retry"
                  onClick={() => handleRetry(msg.id)}
                >
                  Retry
                </button>
              )}
              {msg.isEdited && <span className="chat-edited">Edited</span>}
            </div>
            {showActions && (
              <div className="notifications-chat-actions">
                <button type="button" onClick={() => handleEdit(msg)}>
                  Edit
                </button>
                <button type="button" onClick={() => handleDelete(msg)}>
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>,
      );
    });
    return nodes;
  };

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div>
          <h1>Notifications</h1>
          <p>Keep track of updates from BhoomiSetu and Customer Service.</p>
        </div>
        <div className="notifications-actions">
          <label className="notifications-toggle">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(event) => setUnreadOnly(event.target.checked)}
            />
            &nbsp; Show unread only
          </label>
          <button className="notifications-action" onClick={handleMarkAllRead} disabled={unreadCount === 0}>
            Mark all read
          </button>
        </div>
      </div>

      {error && <div className="notifications-error">{error}</div>}

      <div className="notifications-content">
        <section className="notifications-list">
          {loading ? (
            <div className="notifications-loading">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="notifications-empty">
              <h3>No notifications yet</h3>
              <p>Updates and alerts will appear here as they become available.</p>
            </div>
          ) : (
            <div className="notifications-cards">
              {notifications.map((item) => (
                <button
                  key={item.id}
                  className={`notifications-card ${item.readAt ? 'read' : 'unread'} type-${item.type}`}
                  onClick={() => handleMarkRead(item)}
                >
                  <div className="notifications-card-header">
                    <div className="notifications-card-title">
                      {!item.readAt && <span className="notifications-dot" />}
                      <span>{item.title}</span>
                    </div>
                    <span className="notifications-time">{formatTime(item.createdAt)}</span>
                  </div>
                  <p className="notifications-message">{resolveMessage(item)}</p>
                  <div className="notifications-meta">
                    <span className={`notifications-tag priority-${item.priority}`}>{item.priority}</span>
                    <span className="notifications-tag">{item.type.replace(/_/g, ' ')}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        <aside className="notifications-chat">
          <div className="notifications-chat-header">
            <h2>Chat with Support</h2>
            <span className="notifications-chat-count">Unread now: {activeCount}</span>
          </div>
          <div className="notifications-chat-body">
            <div className="notifications-chat-users" ref={usersRef}>
              {enabledUsers.map((user) => (
                <button
                  key={user.id}
                  className={`notifications-chat-user ${selectedUserId === user.id ? 'active' : ''}`}
                  onClick={() => setSelectedUserId(user.id)}
                >
                  <span className="notifications-chat-user-title">{user.name}</span>
                  <span className="notifications-chat-user-role">{user.role.replace('_', ' ')}</span>
                  {user.enabled && <span className="notifications-chat-user-status">Enabled</span>}
                </button>
              ))}
            </div>
            <div className="notifications-chat-panel">
              <div className="notifications-chat-messages" ref={messagesRef}>
                {renderMessages()}
                {isRemoteTyping && (
                  <div className="notifications-chat-row support">
                    <div className="notifications-chat-avatar">S</div>
                    <div className="notifications-chat-bubble support typing">
                      <span className="typing-dots" />
                      <small>User is typing...</small>
                    </div>
                  </div>
                )}
                {activeChat.length === 0 && !isRemoteTyping && (
                  <div className="notifications-chat-empty">Start a conversation with support.</div>
                )}
              </div>
              {showScrollDown && (
                <button className="notifications-chat-scroll" onClick={() => scrollToBottom()}>
                  Scroll to latest
                </button>
              )}
              <div className="notifications-chat-input">
                <textarea
                  ref={inputRef}
                  value={chatInput}
                  placeholder="Type your message here..."
                  onChange={(event) => {
                    setChatInput(event.target.value);
                    event.currentTarget.style.height = 'auto';
                    event.currentTarget.style.height = `${event.currentTarget.scrollHeight}px`;
                    scheduleTyping();
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      handleSendChat();
                    }
                  }}
                  rows={1}
                />
                <button onClick={handleSendChat} aria-label="Send message">
                  <i className="fa fa-paper-plane" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
