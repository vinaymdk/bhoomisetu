CREATE TABLE IF NOT EXISTS support_chat_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  support_role VARCHAR(50) NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_chat_access_user_id ON support_chat_access(user_id);
CREATE INDEX IF NOT EXISTS idx_support_chat_access_support_role ON support_chat_access(support_role);
CREATE INDEX IF NOT EXISTS idx_support_chat_access_is_enabled ON support_chat_access(is_enabled);
