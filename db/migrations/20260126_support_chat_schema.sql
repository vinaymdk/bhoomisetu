-- Support Chat (Customer Service) schema

CREATE TABLE IF NOT EXISTS support_chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  support_role VARCHAR(50) NOT NULL, -- customer_service | buyer | seller | agent
  status VARCHAR(20) NOT NULL DEFAULT 'open',
  assigned_agent_id UUID REFERENCES users (id) ON DELETE SET NULL,
  typing_by_user_id UUID REFERENCES users (id) ON DELETE SET NULL,
  typing_at TIMESTAMPTZ,
  last_message_at TIMESTAMPTZ,
  message_count INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_chat_sessions_user_id ON support_chat_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_support_chat_sessions_support_role ON support_chat_sessions (support_role);
CREATE INDEX IF NOT EXISTS idx_support_chat_sessions_status ON support_chat_sessions (status);
CREATE INDEX IF NOT EXISTS idx_support_chat_sessions_last_message_at ON support_chat_sessions (last_message_at);

CREATE TABLE IF NOT EXISTS support_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES support_chat_sessions (id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  sender_role VARCHAR(30) NOT NULL, -- user | support
  message_type VARCHAR(20) NOT NULL DEFAULT 'text',
  content TEXT NOT NULL,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMPTZ,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_chat_messages_session_id ON support_chat_messages (session_id);
CREATE INDEX IF NOT EXISTS idx_support_chat_messages_sender_id ON support_chat_messages (sender_id);
CREATE INDEX IF NOT EXISTS idx_support_chat_messages_created_at ON support_chat_messages (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_chat_messages_read_at ON support_chat_messages (read_at);
