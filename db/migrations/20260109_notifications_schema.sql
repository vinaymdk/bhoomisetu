-- Notifications Module (Module 9)
-- Multi-channel notifications: Push (Firebase FCM), SMS, Email

-- Notification Preferences table (user preferences for notification channels)
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  
  -- Channel Preferences
  push_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT true,
  email_enabled BOOLEAN DEFAULT true,
  
  -- Notification Type Preferences
  property_match_enabled BOOLEAN DEFAULT true,
  price_drop_enabled BOOLEAN DEFAULT true,
  viewing_reminder_enabled BOOLEAN DEFAULT true,
  subscription_renewal_enabled BOOLEAN DEFAULT true,
  cs_followup_enabled BOOLEAN DEFAULT true,
  interest_expression_enabled BOOLEAN DEFAULT true,
  mediation_update_enabled BOOLEAN DEFAULT true,
  ai_chat_escalation_enabled BOOLEAN DEFAULT true,
  
  -- Quiet Hours (optional)
  quiet_hours_start TIME, -- e.g., '22:00:00'
  quiet_hours_end TIME,   -- e.g., '08:00:00'
  
  -- Device/Channel Info
  fcm_token VARCHAR(500), -- Firebase Cloud Messaging token (for push notifications)
  phone_number VARCHAR(20), -- For SMS (can be different from primary_phone)
  email_address VARCHAR(255), -- For email (can be different from primary_email)
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Indexes for notification_preferences
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences (user_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_fcm_token ON notification_preferences (fcm_token) WHERE fcm_token IS NOT NULL;

-- Notifications table (all notifications sent)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  
  -- Notification Details
  type VARCHAR(50) NOT NULL, -- 'property_match', 'price_drop', 'viewing_reminder', 'subscription_renewal', 'cs_followup', 'interest_expression', 'mediation_update', 'ai_chat_escalation', 'general'
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  message_english TEXT, -- English version (for Telugu users)
  message_telugu TEXT,  -- Telugu version (for English users)
  
  -- Notification Data (JSON payload)
  data JSONB, -- Additional data (property_id, requirement_id, interest_id, etc.)
  
  -- Priority
  priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  
  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'failed', 'read'
  read_at TIMESTAMPTZ,
  
  -- Delivery Channels
  channels_sent TEXT[], -- Array of channels used: ['push', 'sms', 'email']
  push_sent BOOLEAN DEFAULT false,
  sms_sent BOOLEAN DEFAULT false,
  email_sent BOOLEAN DEFAULT false,
  
  -- Delivery Timestamps
  push_sent_at TIMESTAMPTZ,
  sms_sent_at TIMESTAMPTZ,
  email_sent_at TIMESTAMPTZ,
  
  -- Error Handling
  delivery_error TEXT, -- Error message if delivery failed
  retry_count INT DEFAULT 0,
  max_retries INT DEFAULT 3,
  
  -- Metadata
  metadata JSONB, -- Additional metadata (campaign_id, template_id, etc.)
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ -- For time-sensitive notifications (e.g., viewing reminders)
);

-- Indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications (type);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications (status);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON notifications (read_at) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON notifications (expires_at) WHERE expires_at IS NOT NULL;

-- Notification Delivery Logs table (detailed delivery tracking)
CREATE TABLE IF NOT EXISTS notification_delivery_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL REFERENCES notifications (id) ON DELETE CASCADE,
  
  -- Channel Details
  channel VARCHAR(20) NOT NULL, -- 'push', 'sms', 'email'
  
  -- Delivery Status
  status VARCHAR(50) NOT NULL, -- 'sent', 'delivered', 'failed', 'bounced', 'opened'
  status_message TEXT, -- Detailed status message from provider
  
  -- Delivery Info
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ, -- For email push notifications
  clicked_at TIMESTAMPTZ, -- For email/push notifications
  
  -- Provider Response
  provider_message_id VARCHAR(255), -- External provider's message ID
  provider_response JSONB, -- Full response from provider (Firebase, SMS gateway, Email service)
  
  -- Error Details
  error_code VARCHAR(50),
  error_message TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for notification_delivery_logs
CREATE INDEX IF NOT EXISTS idx_notification_delivery_logs_notification_id ON notification_delivery_logs (notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_delivery_logs_channel ON notification_delivery_logs (channel);
CREATE INDEX IF NOT EXISTS idx_notification_delivery_logs_status ON notification_delivery_logs (status);
CREATE INDEX IF NOT EXISTS idx_notification_delivery_logs_created_at ON notification_delivery_logs (created_at DESC);

-- Notification Templates table (for reusable notification templates)
CREATE TABLE IF NOT EXISTS notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Template Details
  name VARCHAR(100) NOT NULL UNIQUE, -- e.g., 'property_match', 'price_drop', 'cs_followup'
  type VARCHAR(50) NOT NULL, -- 'property_match', 'price_drop', etc.
  
  -- Template Content
  title_template TEXT NOT NULL, -- Template with variables: "New property match: {property_title}"
  message_template TEXT NOT NULL, -- Template with variables: "A new property matches your requirement: {property_title} in {location}"
  title_template_telugu TEXT, -- Telugu version
  message_template_telugu TEXT, -- Telugu version
  
  -- Channel-specific templates
  push_title_template TEXT, -- Push notification title (shorter)
  push_message_template TEXT, -- Push notification message (shorter)
  sms_template TEXT, -- SMS template (160 chars max)
  email_subject_template TEXT, -- Email subject template
  email_body_template TEXT, -- Email body template (HTML supported)
  
  -- Template Variables (documentation)
  variables JSONB, -- Array of variable names: ['property_title', 'location', 'price', etc.]
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for notification_templates
CREATE INDEX IF NOT EXISTS idx_notification_templates_name ON notification_templates (name);
CREATE INDEX IF NOT EXISTS idx_notification_templates_type ON notification_templates (type);
CREATE INDEX IF NOT EXISTS idx_notification_templates_active ON notification_templates (is_active) WHERE is_active = true;

-- Comments
COMMENT ON TABLE notification_preferences IS 'User preferences for notification channels and types. Supports quiet hours and per-channel preferences.';
COMMENT ON TABLE notifications IS 'All notifications sent to users. Tracks delivery status across multiple channels (push, SMS, email).';
COMMENT ON TABLE notification_delivery_logs IS 'Detailed delivery logs for each notification channel. Tracks status, provider responses, and errors.';
COMMENT ON TABLE notification_templates IS 'Reusable notification templates with support for multiple languages and channels.';
COMMENT ON COLUMN notification_preferences.fcm_token IS 'Firebase Cloud Messaging token for push notifications. Updated when user logs in on new device.';
COMMENT ON COLUMN notifications.channels_sent IS 'Array of channels used to deliver notification: [''push'', ''sms'', ''email'']. Allows multi-channel delivery.';
COMMENT ON COLUMN notification_delivery_logs.provider_message_id IS 'External provider message ID (Firebase message ID, SMS gateway ID, Email service ID) for tracking and debugging.';
