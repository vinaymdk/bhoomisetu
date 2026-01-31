import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { notificationsService } from '../services/notifications.service';
import type { NotificationItem } from '../types/notification';
import { supportChatService } from '../services/supportChat.service';
import { createSupportChatSocket } from '../services/supportChatSocket';
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
  const { user, roles } = useAuth();
  const currentUserId = user?.id;
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<SupportChatRole>('customer_service');
  const [allowedRoles, setAllowedRoles] = useState<SupportChatRole[]>([]);
  const [activeSession, setActiveSession] = useState<SupportChatSession | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Record<string, SupportChatMessage[]>>({});
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [isRemoteTyping, setIsRemoteTyping] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [isLoadingEarlier, setIsLoadingEarlier] = useState(false);
  const [unreadByRole, setUnreadByRole] = useState<Record<string, number>>({});
  const [activeUnseenCount, setActiveUnseenCount] = useState(0);
  const [isInputFocused, setIsInputFocused] = useState(true);
  const [rolesOnline, setRolesOnline] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const usersRef = useRef<HTMLDivElement | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const socketRef = useRef<ReturnType<typeof createSupportChatSocket> | null>(null);

  const activeCount = useMemo(
    () => notifications.filter((item) => !item.readAt).length,
    [notifications],
  );

  const notifyBadgeUpdate = (count: number) => {
    window.dispatchEvent(new CustomEvent('notificationsBadgeUpdated', { detail: count }));
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    window.setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 2500);
  };

  const selectionActive = selectedIds.length > 0;
  const allSelected = notifications.length > 0 && selectedIds.length === notifications.length;
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((current) => current !== id) : [...prev, id],
    );
  };
  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? [] : notifications.map((item) => item.id));
  };
  const clearSelection = () => setSelectedIds([]);

  const loadNotifications = async () => {
    if (!currentUserId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await notificationsService.list({ unreadOnly });
      setNotifications(response.notifications);
      setUnreadCount(response.unreadCount);
      setSelectedIds((prev) =>
        prev.filter((id) => response.notifications.some((item) => item.id === id)),
      );
      notifyBadgeUpdate(response.unreadCount);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [unreadOnly, currentUserId]);

  useEffect(() => {
    if (!currentUserId) return;
    refreshUnreadCounts();
  }, [currentUserId]);

  useEffect(() => {
    if (!currentUserId) return;
    supportChatService
      .listAllowedRoles()
      .then((rolesList) => {
        setAllowedRoles(rolesList);
        if (rolesList.length > 0 && !rolesList.includes(selectedUserId)) {
          setSelectedUserId(rolesList[0]);
        }
        if (rolesList.length === 0) {
          setActiveSession(null);
        }
      })
      .catch(() => {
        const canChatSupport =
          roles.includes('buyer') || roles.includes('seller') || roles.includes('agent') || roles.includes('admin');
        const isSupport = roles.includes('customer_service') || roles.includes('admin');
        if (isSupport) {
          setAllowedRoles(['buyer', 'seller', 'agent']);
        } else if (canChatSupport) {
          setAllowedRoles(['customer_service']);
        } else {
          setAllowedRoles([]);
        }
      });
  }, [currentUserId, roles, selectedUserId]);

  const handleMarkAllRead = async () => {
    if (!currentUserId) return;
    try {
      await notificationsService.markAllRead();
      await loadNotifications();
      showToast('All notifications marked as read.');
    } catch {
      showToast('Failed to mark all notifications as read.', 'error');
    }
  };

  const handleMarkRead = async (item: NotificationItem) => {
    if (item.readAt) return;
    if (!currentUserId) return;
    try {
      await notificationsService.markRead(item.id);
      setNotifications((prev) =>
        prev.map((current) =>
          current.id === item.id ? { ...current, readAt: new Date().toISOString(), status: 'read' } : current,
        ),
      );
      setUnreadCount((prev) => {
        const next = Math.max(0, prev - 1);
        notifyBadgeUpdate(next);
        return next;
      });
    } catch {
      showToast('Failed to mark notification as read.', 'error');
    }
  };

  const handleDeleteSelected = async () => {
    if (!currentUserId || selectedIds.length === 0) return;
    try {
      await notificationsService.deleteMany(selectedIds);
      clearSelection();
      await loadNotifications();
      showToast('Selected notifications deleted.');
    } catch {
      showToast('Failed to delete selected notifications.', 'error');
    }
  };

  const handleDeleteAll = async () => {
    if (!currentUserId || notifications.length === 0) return;
    const confirmed = window.confirm('Delete all notifications? This cannot be undone.');
    if (!confirmed) return;
    try {
      await notificationsService.deleteAll();
      clearSelection();
      await loadNotifications();
      showToast('All notifications deleted.');
    } catch {
      showToast('Failed to delete notifications.', 'error');
    }
  };

  const handleDeleteOne = async (item: NotificationItem) => {
    if (!currentUserId) return;
    try {
      await notificationsService.deleteOne(item.id);
      await loadNotifications();
      showToast('Notification deleted.');
    } catch {
      showToast('Failed to delete notification.', 'error');
    }
  };

  const roleLabels: Record<SupportChatRole, string> = {
    customer_service: 'Customer Service',
    buyer: 'Buyer Support',
    seller: 'Seller Support',
    agent: 'Agent Support',
  };
  const roleEmails: Partial<Record<SupportChatRole, string>> = {
    customer_service: 'support@bhoomisetu.com',
  };

  const enabledUsers = useMemo(
    () =>
      allowedRoles.map((role) => ({
        id: role,
        name: roleLabels[role],
        role,
        email: roleEmails[role],
        enabled: true,
      })),
    [allowedRoles],
  );

  const refreshUnreadCounts = async () => {
    if (!currentUserId || !localStorage.getItem('accessToken')) return;
    try {
      const data = await supportChatService.getUnreadCounts();
      setUnreadByRole(data.byRole || {});
      window.dispatchEvent(new CustomEvent('chatBadgeUpdated', { detail: data.total || 0 }));
    } catch {
      // ignore
    }
  };

  const activeChat = activeSession ? chatMessages[activeSession.id] || [] : [];

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

  const loadSession = async (role: SupportChatRole) => {
    if (!currentUserId || !localStorage.getItem('accessToken')) return;
    const session = await supportChatService.getOrCreateSession(role);
    setActiveSession(session);
    if (!chatMessages[session.id]) {
      const messages = await supportChatService.listMessages(session.id, 50);
      setChatMessages((prev) => ({ ...prev, [session.id]: messages }));
    }
    setIsRemoteTyping(false);
    setActiveUnseenCount(0);
    setUnreadByRole((prev) => ({ ...prev, [role]: 0 }));
    await supportChatService.markSessionRead(session.id);
    refreshUnreadCounts();
    setTimeout(() => scrollToBottom('auto'), 0);
  };

  useEffect(() => {
    if (!allowedRoles.includes(selectedUserId)) return;
    loadSession(selectedUserId).catch(() => undefined);
  }, [selectedUserId, allowedRoles]);

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
      status: 'sending',
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
        msg.id === messageId ? { ...msg, status: 'sending' } : msg,
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
    if (atBottom && activeUnseenCount > 0) {
      setActiveUnseenCount(0);
      if (currentUserId && localStorage.getItem('accessToken')) {
        supportChatService.markSessionRead(activeSession.id).catch(() => undefined);
      }
      refreshUnreadCounts();
    }
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
    const socket = createSupportChatSocket();
    socketRef.current = socket;
    socket.on('connect', () => {
      socket.emit('presence:request');
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !activeSession) return;
    socket.emit('join', { sessionId: activeSession.id });
    return () => {
      socket.emit('leave', { sessionId: activeSession.id });
    };
  }, [activeSession?.id]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    const handleMessage = (payload: { action: string; message: SupportChatMessage }) => {
      const { message } = payload;
      setChatMessages((prev) => {
        const list = prev[message.sessionId] || [];
        const exists = list.some((item) => item.id === message.id);
        let next: SupportChatMessage[];
        if (exists) {
          next = list.map((item) => (item.id === message.id ? message : item));
        } else {
          const sendingIndex =
            message.senderId === currentUserId
              ? list.findIndex((item) => item.status === 'sending' && item.content === message.content)
              : -1;
          if (sendingIndex >= 0) {
            next = list.map((item, idx) => (idx === sendingIndex ? message : item));
          } else {
            next = [...list, message];
          }
        }
        return { ...prev, [message.sessionId]: next.slice(-200) };
      });
      refreshUnreadCounts();
      if (activeSession?.id === message.sessionId && message.senderId !== currentUserId) {
        const shouldAutoScroll = isAtBottom() || isInputFocused;
        if (shouldAutoScroll && currentUserId && localStorage.getItem('accessToken')) {
          supportChatService.markSessionRead(message.sessionId).catch(() => undefined);
          setUnreadByRole((prev) => ({ ...prev, [selectedUserId]: 0 }));
          setActiveUnseenCount(0);
          setTimeout(() => scrollToBottom('smooth'), 0);
        } else {
          setActiveUnseenCount((prev) => prev + 1);
        }
      }
    };
    const handleTyping = (payload: { sessionId: string; typingByUserId?: string | null; typingAt?: string | null }) => {
      if (!activeSession || payload.sessionId !== activeSession.id) return;
      const typingAt = payload.typingAt ? new Date(payload.typingAt).getTime() : 0;
      const isRemote = !!payload.typingByUserId && payload.typingByUserId !== currentUserId;
      setIsRemoteTyping(isRemote && Date.now() - typingAt < 6000);
    };
    const handlePresence = (payload: { rolesOnline?: Record<string, boolean> }) => {
      setRolesOnline(payload.rolesOnline || {});
    };
    socket.on('message', handleMessage);
    socket.on('typing', handleTyping);
    socket.on('presence', handlePresence);
    return () => {
      socket.off('message', handleMessage);
      socket.off('typing', handleTyping);
      socket.off('presence', handlePresence);
    };
  }, [activeSession?.id, currentUserId]);

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
    if (!activeSession || !currentUserId) return;
    const socket = socketRef.current;
    if (socket) {
      socket.emit('typing', { sessionId: activeSession.id, userId: currentUserId, isTyping: true });
    } else {
      supportChatService.setTyping(activeSession.id, true).catch(() => undefined);
    }
    if (typingTimerRef.current) window.clearTimeout(typingTimerRef.current);
    typingTimerRef.current = window.setTimeout(() => {
      if (socket) {
        socket.emit('typing', { sessionId: activeSession.id, userId: currentUserId, isTyping: false });
      } else {
        supportChatService.setTyping(activeSession.id, false).catch(() => undefined);
      }
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
    if (status === 'sending') {
      return <i className="fa fa-clock status-sending" aria-hidden="true" />;
    }
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

  const getMessageStatus = (message: SupportChatMessage) => {
    if (message.status === 'failed' || message.status === 'sending') {
      return message.status;
    }
    if (message.readAt) return 'read';
    if (message.deliveredAt) return 'delivered';
    return 'sent';
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
      const isUnread = !isUser && !msg.readAt;
      const isDeleted = msg.isDeleted;
      nodes.push(
        <div key={msg.id} className={`notifications-chat-row ${isUser ? 'user' : 'support'}`}>
          <div className="notifications-chat-avatar">
            {msg.senderAvatarUrl ? (
              <img src={msg.senderAvatarUrl} alt={msg.senderName || 'User'} />
            ) : (
              (msg.senderName || (isUser ? 'You' : 'Support')).slice(0, 1)
            )}
          </div>
          <div
            className={`notifications-chat-bubble ${isUser ? 'user' : 'support'} ${isUnread ? 'unread' : ''} ${
              isDeleted ? 'deleted' : ''
            }`}
          >
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
              <span className={isDeleted ? 'notifications-chat-deleted-text' : undefined}>
                {isDeleted ? 'This message was deleted' : msg.content}
              </span>
            )}
            <div className="notifications-chat-meta">
              <small className="chat-time">{formatTime(msg.createdAt)}</small>
              {isUser && !isDeleted && (
                <span className="notifications-chat-status">
                  {renderStatusIcon(getMessageStatus(msg))}
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
          {notifications.length > 0 && (
            <>
              <label className="notifications-toggle">
                <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} />
                &nbsp; Select all
              </label>
              <button
                className="notifications-action"
                onClick={handleDeleteSelected}
                disabled={!selectionActive}
              >
                Delete selected
              </button>
              <button
                className="notifications-action notifications-action-danger"
                onClick={handleDeleteAll}
              >
                Delete all
              </button>
            </>
          )}
        </div>
      </div>

      {toast && <div className={`notifications-toast ${toast.type}`}>{toast.message}</div>}

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
                <div
                  key={item.id}
                  className={`notifications-card ${item.readAt ? 'read' : 'unread'} type-${item.type}`}
                  onClick={() => handleMarkRead(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      handleMarkRead(item);
                    }
                  }}
                >
                  <div className="notifications-card-header">
                    <div className="notifications-card-title">
                      <input
                        type="checkbox"
                        className="notifications-select-checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => toggleSelect(item.id)}
                        onClick={(event) => event.stopPropagation()}
                      />
                      {!item.readAt && <span className="notifications-dot" />}
                      <span>{item.title}</span>
                    </div>
                    <span className="notifications-time">{formatTime(item.createdAt)}</span>
                  </div>
                  <p className="notifications-message">{resolveMessage(item)}</p>
                  <div className="notifications-meta">
                    <span className={`notifications-tag priority-${item.priority}`}>{item.priority}</span>
                    <span className="notifications-tag">{item.type.replace(/_/g, ' ')}</span>
                    <button
                      type="button"
                      className="notifications-card-delete"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDeleteOne(item);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
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
              {enabledUsers.length === 0 && (
                <div className="notifications-chat-empty">
                  Chat is available only for CS-enabled and approved users.
                </div>
              )}
              {enabledUsers.map((user) => (
                <button
                  key={user.id}
                  className={`notifications-chat-user ${selectedUserId === user.id ? 'active' : ''}`}
                  onClick={() => setSelectedUserId(user.id)}
                >
                  <div className="notifications-chat-user-header">
                    <span className="notifications-chat-avatar">{user.name.slice(0, 1)}</span>
                    <span className="notifications-chat-user-title">{user.name}</span>
                    <span
                      className={`notifications-chat-online ${rolesOnline[user.role] ? 'online' : 'offline'}`}
                    />
                  </div>
                  <span className="notifications-chat-user-role">
                    {user.email || user.role.replace('_', ' ')}
                  </span>
                  {unreadByRole[user.role] > 0 && (
                    <span className="notifications-chat-user-badge">{unreadByRole[user.role]}</span>
                  )}
                </button>
              ))}
            </div>
            <div className="notifications-chat-panel">
              <div className="notifications-chat-panel-header">
                <div className="notifications-chat-panel-title">
                  <span className="notifications-chat-avatar">
                    {enabledUsers.find((item) => item.id === selectedUserId)?.name.slice(0, 1) || 'S'}
                  </span>
                  <div>
                    <strong>{enabledUsers.find((item) => item.id === selectedUserId)?.name || 'Support'}</strong>
                    <span className={`notifications-chat-online ${rolesOnline[selectedUserId] ? 'online' : 'offline'}`} />
                  </div>
                </div>
                {activeUnseenCount > 0 && (
                  <span className="notifications-chat-unseen">New: {activeUnseenCount}</span>
                )}
              </div>
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
                  onFocus={() => {
                    setIsInputFocused(true);
                    setActiveUnseenCount(0);
                    if (activeSession && currentUserId && localStorage.getItem('accessToken')) {
                      supportChatService.markSessionRead(activeSession.id).catch(() => undefined);
                      refreshUnreadCounts();
                    }
                  }}
                  onBlur={() => setIsInputFocused(false)}
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
