import { useEffect, useMemo, useRef, useState } from 'react';
import { supportChatAdminService } from '../services/supportChatAdmin.service';
import { supportChatService } from '../services/supportChat.service';
import type { SupportChatAdminSession, SupportChatMessage, SupportChatRole } from '../types/supportChat';
import './SupportChatAdminPage.css';

const formatTime = (iso: string) => {
  const date = new Date(iso);
  return date.toLocaleString();
};

export const SupportChatAdminPage = () => {
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
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeSessionId = selectedSession?.id;

  const loadSessions = async () => {
    setLoading(true);
    const data = await supportChatAdminService.listSessions({
      search: search || undefined,
      status: status || undefined,
      supportRole: supportRole || undefined,
    });
    setSessions(data);
    setLoading(false);
    if (!selectedSession && data.length > 0) {
      setSelectedSession(data[0]);
    }
  };

  const loadMessages = async (sessionId: string) => {
    setChatLoading(true);
    const data = await supportChatService.listMessages(sessionId, 50);
    setMessages(data);
    setChatLoading(false);
    setTimeout(() => scrollToBottom('auto'), 0);
  };

  useEffect(() => {
    loadSessions().catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!activeSessionId) return;
    loadMessages(activeSessionId).catch(() => undefined);
  }, [activeSessionId]);

  useEffect(() => {
    if (!activeSessionId) return;
    const interval = window.setInterval(async () => {
      const [latest, typing] = await Promise.all([
        supportChatService.listMessages(activeSessionId, 50),
        supportChatService.getTyping(activeSessionId),
      ]);
      setMessages(latest);
      const typingAt = typing.typingAt ? new Date(typing.typingAt).getTime() : 0;
      setIsRemoteTyping(
        !!typing.typingByUserId && Date.now() - typingAt < 6000,
      );
    }, 4000);
    return () => window.clearInterval(interval);
  }, [activeSessionId]);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (!messagesRef.current) return;
    messagesRef.current.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior,
    });
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
    if (!activeSessionId) return;
    supportChatService.setTyping(activeSessionId, true).catch(() => undefined);
    if (typingTimerRef.current) window.clearTimeout(typingTimerRef.current);
    typingTimerRef.current = window.setTimeout(() => {
      supportChatService.setTyping(activeSessionId, false).catch(() => undefined);
    }, 1500);
  };

  const handleSend = async () => {
    if (!activeSessionId) return;
    const trimmed = chatInput.trim();
    if (!trimmed) return;
    const saved = await supportChatService.sendMessage(activeSessionId, trimmed);
    setMessages((prev) => [...prev, saved].slice(-200));
    setChatInput('');
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.focus();
    }
    scrollToBottom('smooth');
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
      nodes.push(
        <div key={msg.id} className={`support-chat-row ${isSupport ? 'support' : 'user'}`}>
          <div className="support-chat-avatar">{(msg.senderName || 'U').slice(0, 1)}</div>
          <div className={`support-chat-bubble ${isSupport ? 'support' : 'user'}`}>
            {isEditing ? (
              <div className="support-chat-edit">
                <textarea value={editingText} onChange={(e) => setEditingText(e.target.value)} />
                <div className="support-chat-edit-actions">
                  <button onClick={handleEditSave}>Save</button>
                  <button onClick={() => setEditingMessageId(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <span>{msg.isDeleted ? 'Message deleted' : msg.content}</span>
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
                <strong>{session.userName}</strong>
                <span>{session.supportRole.replace('_', ' ')}</span>
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
            {chatLoading ? <div className="support-chat-state">Loading messages...</div> : renderMessages()}
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
              onChange={(event) => {
                setChatInput(event.target.value);
                event.currentTarget.style.height = 'auto';
                event.currentTarget.style.height = `${event.currentTarget.scrollHeight}px`;
                scheduleTyping();
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  handleSend();
                }
              }}
              rows={1}
            />
            <button onClick={handleSend} aria-label="Send reply">
              <i className="fa fa-paper-plane" aria-hidden="true" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
