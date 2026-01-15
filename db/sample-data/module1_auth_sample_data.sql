-- Module 1: Authentication & Roles - Sample Data
-- This file contains sample data for testing authentication and user management
-- NOTE: Uses actual database schema from migrations

-- Insert Roles (using code, not id - roles are already seeded, but adding if needed)
INSERT INTO roles (code, name, description, created_at, updated_at)
VALUES 
  ('buyer', 'Buyer', 'Property buyer role', NOW(), NOW()),
  ('seller', 'Seller', 'Property seller role', NOW(), NOW()),
  ('agent', 'Agent', 'Real estate agent role', NOW(), NOW()),
  ('customer_service', 'Customer Service', 'Customer service representative role', NOW(), NOW()),
  ('admin', 'Admin', 'System administrator role', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Get role IDs for user_roles assignment
DO $$
DECLARE
  buyer_role_id INT;
  seller_role_id INT;
  agent_role_id INT;
  cs_role_id INT;
  admin_role_id INT;
BEGIN
  SELECT id INTO buyer_role_id FROM roles WHERE code = 'buyer';
  SELECT id INTO seller_role_id FROM roles WHERE code = 'seller';
  SELECT id INTO agent_role_id FROM roles WHERE code = 'agent';
  SELECT id INTO cs_role_id FROM roles WHERE code = 'customer_service';
  SELECT id INTO admin_role_id FROM roles WHERE code = 'admin';

  -- Sample Users (using UUIDs)
  INSERT INTO users (id, primary_email, primary_phone, full_name, status, fraud_risk_score, created_at, updated_at)
  VALUES 
    -- Buyer User
    ('550e8400-e29b-41d4-a716-446655440001', 'buyer1@example.com', '+919876543210', 'Rajesh Kumar', 'active', 10, NOW(), NOW()),
    
    -- Seller User
    ('550e8400-e29b-41d4-a716-446655440002', 'seller1@example.com', '+919876543211', 'Priya Sharma', 'active', 10, NOW(), NOW()),
    
    -- Agent User
    ('550e8400-e29b-41d4-a716-446655440003', 'agent1@example.com', '+919876543212', 'Amit Patel', 'active', 10, NOW(), NOW()),
    
    -- User with Multiple Roles (Buyer + Seller)
    ('550e8400-e29b-41d4-a716-446655440004', 'multiuser@example.com', '+919876543213', 'Suresh Reddy', 'active', 10, NOW(), NOW()),
    
    -- Customer Service User
    ('550e8400-e29b-41d4-a716-446655440005', 'cs1@example.com', '+919876543214', 'Anjali Mehta', 'active', 0, NOW(), NOW()),
    
    -- Admin User
    ('550e8400-e29b-41d4-a716-446655440006', 'admin@example.com', '+919876543215', 'Admin User', 'active', 0, NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;

  -- Assign Roles to Users
  INSERT INTO user_roles (user_id, role_id, created_at)
  VALUES 
    -- Buyer
    ('550e8400-e29b-41d4-a716-446655440001', buyer_role_id, NOW()),
    
    -- Seller
    ('550e8400-e29b-41d4-a716-446655440002', seller_role_id, NOW()),
    
    -- Agent
    ('550e8400-e29b-41d4-a716-446655440003', agent_role_id, NOW()),
    
    -- Multi-role user (Buyer + Seller)
    ('550e8400-e29b-41d4-a716-446655440004', buyer_role_id, NOW()),
    ('550e8400-e29b-41d4-a716-446655440004', seller_role_id, NOW()),
    
    -- Customer Service
    ('550e8400-e29b-41d4-a716-446655440005', cs_role_id, NOW()),
    
    -- Admin
    ('550e8400-e29b-41d4-a716-446655440006', admin_role_id, NOW())
  ON CONFLICT DO NOTHING;

  -- Sample Login Sessions (for testing session management)
  INSERT INTO login_sessions (id, user_id, ip_address, user_agent, refresh_token_hash, expires_at, risk_score, login_provider, created_at, updated_at)
  VALUES 
    ('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '192.168.1.100', 'Mozilla/5.0...', 'hashed_refresh_token_1', NOW() + INTERVAL '7 days', 10, 'otp', NOW(), NOW()),
    ('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '192.168.1.101', 'Mozilla/5.0...', 'hashed_refresh_token_2', NOW() + INTERVAL '7 days', 10, 'otp', NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;

  -- Sample OTP Logs (for testing OTP flow)
  -- Note: otp_logs doesn't have user_id, uses destination instead
  INSERT INTO otp_logs (id, channel, destination, purpose, otp_hash, expires_at, attempts_count, max_attempts, is_used, sent_at, fraud_risk_score, created_at)
  VALUES 
    ('750e8400-e29b-41d4-a716-446655440001', 'sms', '+919876543210', 'login', 'hashed_otp_1', NOW() + INTERVAL '10 minutes', 0, 5, false, NOW(), 10, NOW()),
    ('750e8400-e29b-41d4-a716-446655440002', 'email', 'seller1@example.com', 'login', 'hashed_otp_2', NOW() + INTERVAL '10 minutes', 1, 5, true, NOW() - INTERVAL '1 hour', 10, NOW() - INTERVAL '1 hour')
  ON CONFLICT (id) DO NOTHING;
END $$;
