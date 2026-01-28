-- Support Chat sample data
DO $$
DECLARE
  v_user UUID;
  v_cs UUID;
  v_session UUID;
BEGIN
  SELECT u.id INTO v_user
  FROM users u
  ORDER BY u.created_at ASC
  LIMIT 1;

  SELECT u.id INTO v_cs
  FROM users u
  JOIN user_roles ur ON ur.user_id = u.id
  JOIN roles r ON r.id = ur.role_id
  WHERE r.code = 'customer_service'
  ORDER BY u.created_at ASC
  LIMIT 1;

  IF v_user IS NOT NULL THEN
    INSERT INTO support_chat_sessions (user_id, support_role, status, assigned_agent_id, last_message_at, message_count)
    VALUES (v_user, 'customer_service', 'open', v_cs, NOW(), 2)
    RETURNING id INTO v_session;

    INSERT INTO support_chat_messages (session_id, sender_id, sender_role, content, delivered_at, created_at)
    VALUES
      (v_session, v_user, 'user', 'Hi, I need help with property verification.', NOW(), NOW() - INTERVAL '5 minutes'),
      (v_session, COALESCE(v_cs, v_user), 'support', 'Sure, please share the property ID.', NOW(), NOW() - INTERVAL '4 minutes');
  END IF;
END $$;
