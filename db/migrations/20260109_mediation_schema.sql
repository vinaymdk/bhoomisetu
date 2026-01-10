-- Mediation & Negotiation Tables (Module 7 - CRITICAL)
-- This module enforces: Buyer and Seller must NEVER contact directly

-- Interest Expressions table (when buyer shows interest in a property)
CREATE TABLE IF NOT EXISTS interest_expressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties (id) ON DELETE CASCADE,
  match_id UUID REFERENCES property_requirement_matches (id) ON DELETE SET NULL, -- Link to the match that triggered this
  
  -- Interest Details
  message TEXT, -- Initial message from buyer (optional)
  interest_type VARCHAR(50) NOT NULL DEFAULT 'viewing', -- 'viewing', 'offer', 'negotiation', 'serious_intent'
  priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  
  -- CS Review Status
  cs_reviewed BOOLEAN DEFAULT false,
  cs_agent_id UUID REFERENCES users (id), -- CS agent who reviewed
  buyer_seriousness_score DECIMAL(5, 2), -- 0-100 (CS assessed)
  buyer_seriousness_notes TEXT, -- CS notes on buyer seriousness
  cs_reviewed_at TIMESTAMPTZ,
  
  -- Seller Willingness Check
  seller_willingness_checked BOOLEAN DEFAULT false,
  seller_willingness_score DECIMAL(5, 2), -- 0-100 (CS assessed)
  seller_willingness_notes TEXT, -- CS notes on seller willingness
  seller_willingness_checked_at TIMESTAMPTZ,
  
  -- Connection Status (CRITICAL)
  connection_status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'cs_reviewing', 'seller_checking', 'approved', 'rejected', 'connected'
  connection_approved_at TIMESTAMPTZ, -- When CS approved the connection
  connection_approved_by UUID REFERENCES users (id), -- CS agent who approved
  
  -- Contact Reveal (CRITICAL - Seller contact hidden until CS approval)
  seller_contact_revealed BOOLEAN DEFAULT false, -- CRITICAL: Only true after CS approval
  seller_contact_revealed_at TIMESTAMPTZ,
  
  -- Chat/Call Session (enabled ONLY after CS approval)
  chat_session_id UUID, -- Reference to chat session (Module 8/WebSocket)
  call_session_id UUID, -- Reference to call session (if applicable)
  
  -- Metadata
  metadata JSONB, -- Additional context, conversation history, etc.
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(buyer_id, property_id) -- One interest expression per buyer-property pair
);

-- Indexes for interest_expressions
CREATE INDEX IF NOT EXISTS idx_interest_expressions_buyer_id ON interest_expressions (buyer_id);
CREATE INDEX IF NOT EXISTS idx_interest_expressions_property_id ON interest_expressions (property_id);
CREATE INDEX IF NOT EXISTS idx_interest_expressions_match_id ON interest_expressions (match_id);
CREATE INDEX IF NOT EXISTS idx_interest_expressions_connection_status ON interest_expressions (connection_status);
CREATE INDEX IF NOT EXISTS idx_interest_expressions_cs_agent_id ON interest_expressions (cs_agent_id) WHERE cs_agent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_interest_expressions_created_at ON interest_expressions (created_at DESC);

-- CS Mediation Actions table (tracks CS actions in mediation workflow)
CREATE TABLE IF NOT EXISTS cs_mediation_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interest_expression_id UUID NOT NULL REFERENCES interest_expressions (id) ON DELETE CASCADE,
  cs_agent_id UUID NOT NULL REFERENCES users (id),
  
  -- Action Details
  action_type VARCHAR(50) NOT NULL, -- 'buyer_seriousness_check', 'seller_willingness_check', 'connection_approval', 'connection_rejection', 'contact_reveal', 'chat_enable', 'call_enable'
  action_status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'rejected'
  
  -- Assessment Scores
  buyer_seriousness_score DECIMAL(5, 2), -- If action is buyer_seriousness_check
  seller_willingness_score DECIMAL(5, 2), -- If action is seller_willingness_check
  
  -- Notes
  notes TEXT, -- CS notes on the action
  internal_notes TEXT, -- Internal notes (not visible to buyer/seller)
  
  -- Outcome
  outcome VARCHAR(50), -- 'approved', 'rejected', 'needs_more_info', 'escalated'
  outcome_reason TEXT,
  
  performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for cs_mediation_actions
CREATE INDEX IF NOT EXISTS idx_cs_mediation_actions_interest_id ON cs_mediation_actions (interest_expression_id);
CREATE INDEX IF NOT EXISTS idx_cs_mediation_actions_cs_agent_id ON cs_mediation_actions (cs_agent_id);
CREATE INDEX IF NOT EXISTS idx_cs_mediation_actions_action_type ON cs_mediation_actions (action_type);
CREATE INDEX IF NOT EXISTS idx_cs_mediation_actions_performed_at ON cs_mediation_actions (performed_at DESC);

-- Chat Sessions table (for mediated chat between buyer and seller)
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interest_expression_id UUID NOT NULL REFERENCES interest_expressions (id) ON DELETE CASCADE,
  
  -- Participants (CRITICAL: CS is always part of the session)
  buyer_id UUID NOT NULL REFERENCES users (id),
  seller_id UUID NOT NULL REFERENCES users (id),
  cs_agent_id UUID NOT NULL REFERENCES users (id), -- CS mediates all conversations
  
  -- Session Status
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'ended', 'paused', 'escalated'
  
  -- Contact Visibility (CRITICAL)
  buyer_can_see_seller_contact BOOLEAN DEFAULT false, -- Only after CS approval
  seller_can_see_buyer_contact BOOLEAN DEFAULT false, -- Only after CS approval
  contact_revealed_at TIMESTAMPTZ, -- When contacts were revealed
  
  -- Session Metadata
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  last_message_at TIMESTAMPTZ,
  message_count INT DEFAULT 0,
  
  -- Metadata
  metadata JSONB, -- Session context, preferences, etc.
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for chat_sessions
CREATE INDEX IF NOT EXISTS idx_chat_sessions_interest_id ON chat_sessions (interest_expression_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_buyer_id ON chat_sessions (buyer_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_seller_id ON chat_sessions (seller_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_cs_agent_id ON chat_sessions (cs_agent_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON chat_sessions (status);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_last_message_at ON chat_sessions (last_message_at DESC) WHERE status = 'active';

-- Chat Messages table (all messages in mediated chat)
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_session_id UUID NOT NULL REFERENCES chat_sessions (id) ON DELETE CASCADE,
  
  -- Message Details
  sender_id UUID NOT NULL REFERENCES users (id), -- Buyer, Seller, or CS Agent
  sender_role VARCHAR(50) NOT NULL, -- 'buyer', 'seller', 'customer_service'
  message_type VARCHAR(50) NOT NULL DEFAULT 'text', -- 'text', 'image', 'file', 'system'
  content TEXT NOT NULL, -- Message content
  
  -- Message Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  is_edited BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  
  -- Moderation (CS can moderate messages)
  is_moderated BOOLEAN DEFAULT false,
  moderated_by UUID REFERENCES users (id), -- CS agent who moderated
  moderation_action VARCHAR(50), -- 'approved', 'flagged', 'removed', 'edited'
  moderation_notes TEXT,
  
  -- Metadata
  metadata JSONB, -- Additional message data (attachments, etc.)
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes for chat_messages
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages (chat_session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages (sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_is_read ON chat_messages (is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_chat_messages_is_moderated ON chat_messages (is_moderated) WHERE is_moderated = true;

-- Comments
COMMENT ON TABLE interest_expressions IS 'Buyer interest expressions in properties. Goes through CS mediation workflow before connection is approved.';
COMMENT ON TABLE cs_mediation_actions IS 'Tracks all CS actions in the mediation workflow (seriousness checks, willingness checks, approvals).';
COMMENT ON TABLE chat_sessions IS 'Mediated chat sessions between buyer and seller. CS is always part of the session. Contact revealed only after CS approval.';
COMMENT ON TABLE chat_messages IS 'All messages in mediated chat sessions. Messages can be moderated by CS agents.';
COMMENT ON COLUMN interest_expressions.seller_contact_revealed IS 'CRITICAL: Only true after CS approval. Seller contact is hidden until CS approves connection.';
COMMENT ON COLUMN chat_sessions.cs_agent_id IS 'CRITICAL: CS agent is always part of the chat session to mediate conversations.';
COMMENT ON COLUMN chat_sessions.buyer_can_see_seller_contact IS 'CRITICAL: Buyer can only see seller contact after CS approval.';
COMMENT ON COLUMN chat_sessions.seller_can_see_buyer_contact IS 'CRITICAL: Seller can only see buyer contact after CS approval.';
