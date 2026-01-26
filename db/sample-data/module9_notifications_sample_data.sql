-- Module 9: Notifications - Sample Data
-- Requires module1_auth_sample_data.sql to run first

-- Notification Templates
INSERT INTO notification_templates (name, type, title_template, message_template, title_template_telugu, message_template_telugu, variables, is_active, created_at, updated_at)
VALUES
  (
    'property_match',
    'property_match',
    'New property match available',
    'A property matches your requirement in {location}. Review the listing for details.',
    'కొత్త ఆస్తి మ్యాచ్ అందుబాటులో ఉంది',
    '{location} లో మీ అవసరానికి సరిపోయే ఆస్తి లభించింది. వివరాలు చూడండి.',
    '["location"]',
    true,
    NOW(),
    NOW()
  ),
  (
    'mediation_update',
    'mediation_update',
    'Mediation update available',
    'Customer Service has reviewed your request. Please check the mediation status in the app.',
    'మధ్యవర్తిత్వం అప్డేట్',
    'మీ అభ్యర్థనపై కస్టమర్ సర్వీస్ అప్డేట్ చేసింది. స్టేటస్ చూడండి.',
    '[]',
    true,
    NOW(),
    NOW()
  ),
  (
    'ai_chat_escalation',
    'ai_chat_escalation',
    'Customer Service has been notified',
    'Your request needs Customer Service review. We will update you after review.',
    'కస్టమర్ సర్వీస్‌కు సమాచారం పంపబడింది',
    'మీ అభ్యర్థనపై కస్టమర్ సర్వీస్ సమీక్ష చేస్తుంది. త్వరలో అప్డేట్ అందుతుంది.',
    '[]',
    true,
    NOW(),
    NOW()
  )
ON CONFLICT (name) DO NOTHING;

-- Notification Preferences
INSERT INTO notification_preferences (user_id, push_enabled, sms_enabled, email_enabled, property_match_enabled, price_drop_enabled, viewing_reminder_enabled, subscription_renewal_enabled, cs_followup_enabled, interest_expression_enabled, mediation_update_enabled, ai_chat_escalation_enabled, phone_number, email_address, created_at, updated_at)
VALUES
  ('550e8400-e29b-41d4-a716-446655440001', true, true, true, true, true, true, true, true, true, true, true, '+919876543210', 'buyer1@example.com', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440002', true, true, true, true, true, true, true, true, true, true, true, '+919876543211', 'seller1@example.com', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440005', true, true, true, true, true, true, true, true, true, true, true, '+919876543214', 'cs1@example.com', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440006', true, true, true, true, true, true, true, true, true, true, true, '+919876543215', 'admin@example.com', NOW(), NOW())
ON CONFLICT (user_id) DO NOTHING;

-- Notifications for Buyer
INSERT INTO notifications (user_id, type, title, message, message_english, message_telugu, data, priority, status, created_at, updated_at)
VALUES
  (
    '550e8400-e29b-41d4-a716-446655440001',
    'property_match',
    'New property match available',
    'A property matches your requirement in Chirala. Review the listing in the app.',
    'A property matches your requirement in Chirala. Review the listing in the app.',
    'Chirala లో మీ అవసరానికి సరిపోయే ఆస్తి లభించింది. లిస్టింగ్ చూడండి.',
    '{"propertyId": "prop-0001"}',
    'normal',
    'sent',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440001',
    'ai_chat_escalation',
    'Customer Service has been notified',
    'Your request requires Customer Service review. We will update you soon.',
    'Your request requires Customer Service review. We will update you soon.',
    'మీ అభ్యర్థనపై కస్టమర్ సర్వీస్ సమీక్ష చేస్తుంది. త్వరలో అప్డేట్ అందుతుంది.',
    '{"caseId": "case-0001"}',
    'high',
    'sent',
    NOW() - INTERVAL '6 hours',
    NOW() - INTERVAL '6 hours'
  );

-- Notifications for Seller
INSERT INTO notifications (user_id, type, title, message, data, priority, status, created_at, updated_at)
VALUES
  (
    '550e8400-e29b-41d4-a716-446655440002',
    'interest_expression',
    'New buyer interest received',
    'A buyer has expressed interest in your listing. Customer Service will review and guide next steps.',
    '{"propertyId": "prop-0002"}',
    'normal',
    'sent',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
  );

-- Notifications for Customer Service (includes contact info)
INSERT INTO notifications (user_id, type, title, message, data, priority, status, created_at, updated_at)
VALUES
  (
    '550e8400-e29b-41d4-a716-446655440005',
    'ai_chat_escalation',
    'Escalation: Buyer request needs review',
    'Buyer Rajesh Kumar requested purchase assistance. Phone: +919876543210, Email: buyer1@example.com.',
    '{"buyerId": "550e8400-e29b-41d4-a716-446655440001", "phoneNumber": "+919876543210", "emailAddress": "buyer1@example.com"}',
    'urgent',
    'sent',
    NOW() - INTERVAL '3 hours',
    NOW() - INTERVAL '3 hours'
  );
