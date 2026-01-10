-- AI Chat Support Tables (Module 8)
-- 24/7 AI Chat Support with Telugu + English support

-- AI Chat Conversations table
CREATE TABLE IF NOT EXISTS ai_chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  
  -- Conversation Context
  session_id VARCHAR(255), -- Unique session identifier (for tracking across requests)
  language VARCHAR(10) NOT NULL DEFAULT 'en', -- 'en' or 'te' (Telugu)
  
  -- Conversation Status
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'escalated', 'completed', 'closed'
  escalated_to_cs BOOLEAN DEFAULT false, -- Whether conversation was escalated to human CS
  cs_agent_id UUID REFERENCES users (id), -- CS agent assigned after escalation
  
  -- Context & Metadata
  context_type VARCHAR(50), -- 'faq', 'property_search', 'requirement_update', 'appointment_booking', 'general'
  context_property_id UUID REFERENCES properties (id), -- If chat is about specific property
  context_requirement_id UUID REFERENCES buyer_requirements (id), -- If chat is about requirement
  
  -- AI Context (for maintaining conversation state)
  conversation_summary TEXT, -- AI-generated summary of conversation
  user_intent VARCHAR(50), -- 'information', 'property_search', 'serious_intent', 'complaint', etc.
  intent_confidence DECIMAL(5, 2), -- 0-100, AI confidence in intent detection
  
  -- Escalation Info
  escalated_at TIMESTAMPTZ,
  escalation_reason TEXT, -- Why conversation was escalated (serious intent, complex query, etc.)
  
  -- Metadata
  metadata JSONB, -- Additional context, preferences, etc.
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

-- Indexes for ai_chat_conversations
CREATE INDEX IF NOT EXISTS idx_ai_chat_conversations_user_id ON ai_chat_conversations (user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_conversations_session_id ON ai_chat_conversations (session_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_conversations_status ON ai_chat_conversations (status);
CREATE INDEX IF NOT EXISTS idx_ai_chat_conversations_escalated ON ai_chat_conversations (escalated_to_cs) WHERE escalated_to_cs = true;
CREATE INDEX IF NOT EXISTS idx_ai_chat_conversations_created_at ON ai_chat_conversations (created_at DESC);

-- AI Chat Messages table
CREATE TABLE IF NOT EXISTS ai_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES ai_chat_conversations (id) ON DELETE CASCADE,
  
  -- Message Details
  sender_type VARCHAR(50) NOT NULL, -- 'user' or 'ai' or 'customer_service' (if escalated)
  sender_id UUID REFERENCES users (id), -- NULL for AI messages, user_id for user/CS messages
  message_type VARCHAR(50) NOT NULL DEFAULT 'text', -- 'text', 'suggestion', 'action', 'system'
  
  -- Message Content
  content TEXT NOT NULL, -- Message text (in user's language)
  content_english TEXT, -- English translation (for Telugu messages)
  content_telugu TEXT, -- Telugu translation (for English messages)
  
  -- AI Response Details
  ai_model_version VARCHAR(50), -- Version of AI model used
  ai_reasoning TEXT, -- AI's reasoning (for debugging/transparency)
  ai_confidence DECIMAL(5, 2), -- 0-100, AI confidence in response
  
  -- Action/Intent Detection
  detected_intent VARCHAR(50), -- 'faq', 'property_search', 'serious_intent', 'appointment', etc.
  suggested_actions JSONB, -- Array of suggested actions (property suggestions, requirement updates, etc.)
  
  -- Escalation Triggers
  requires_escalation BOOLEAN DEFAULT false, -- AI detected serious intent
  escalation_reason TEXT, -- Why this message requires escalation
  
  -- Metadata
  metadata JSONB, -- Additional message data (attachments, structured data, etc.)
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for ai_chat_messages
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_conversation_id ON ai_chat_messages (conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_sender_type ON ai_chat_messages (sender_type);
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_created_at ON ai_chat_messages (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_requires_escalation ON ai_chat_messages (requires_escalation) WHERE requires_escalation = true;

-- AI Chat Actions table (tracks actions taken from AI suggestions)
CREATE TABLE IF NOT EXISTS ai_chat_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES ai_chat_conversations (id) ON DELETE CASCADE,
  message_id UUID REFERENCES ai_chat_messages (id), -- Message that triggered this action
  
  -- Action Details
  action_type VARCHAR(50) NOT NULL, -- 'property_suggested', 'requirement_updated', 'appointment_booked', 'escalated_to_cs'
  action_data JSONB NOT NULL, -- Action-specific data (property ID, requirement ID, appointment details, etc.)
  
  -- Action Status
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'cancelled'
  completed_at TIMESTAMPTZ,
  
  -- User Response
  user_acknowledged BOOLEAN DEFAULT false,
  user_feedback VARCHAR(50), -- 'helpful', 'not_helpful', 'escalate'
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for ai_chat_actions
CREATE INDEX IF NOT EXISTS idx_ai_chat_actions_conversation_id ON ai_chat_actions (conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_actions_action_type ON ai_chat_actions (action_type);
CREATE INDEX IF NOT EXISTS idx_ai_chat_actions_status ON ai_chat_actions (status);

-- AI Chat FAQs table (knowledge base for FAQ handling)
CREATE TABLE IF NOT EXISTS ai_chat_faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- FAQ Content
  question_english TEXT NOT NULL,
  question_telugu TEXT NOT NULL,
  answer_english TEXT NOT NULL,
  answer_telugu TEXT NOT NULL,
  
  -- FAQ Metadata
  category VARCHAR(50), -- 'general', 'property_search', 'pricing', 'verification', 'mediation', etc.
  tags TEXT[], -- Array of tags for better matching
  
  -- Usage Stats
  view_count INT DEFAULT 0,
  helpful_count INT DEFAULT 0,
  not_helpful_count INT DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for ai_chat_faqs
CREATE INDEX IF NOT EXISTS idx_ai_chat_faqs_category ON ai_chat_faqs (category);
CREATE INDEX IF NOT EXISTS idx_ai_chat_faqs_tags ON ai_chat_faqs USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_ai_chat_faqs_active ON ai_chat_faqs (is_active) WHERE is_active = true;

-- Comments
COMMENT ON TABLE ai_chat_conversations IS 'AI Chat Support conversations (24/7). Supports Telugu and English. Escalates to human CS when serious intent detected.';
COMMENT ON TABLE ai_chat_messages IS 'Messages in AI chat conversations. Supports bilingual (Telugu + English) with automatic translation.';
COMMENT ON TABLE ai_chat_actions IS 'Actions taken from AI suggestions (property suggestions, requirement updates, appointment booking, etc.).';
COMMENT ON TABLE ai_chat_faqs IS 'Knowledge base for FAQ handling. Supports both English and Telugu.';
COMMENT ON COLUMN ai_chat_conversations.escalated_to_cs IS 'CRITICAL: Conversation escalated to human CS when serious intent detected or complex query. AI never handles serious transactions.';
COMMENT ON COLUMN ai_chat_messages.requires_escalation IS 'CRITICAL: AI flags messages that require CS escalation (serious intent, seller contact requests, complex negotiations).';
