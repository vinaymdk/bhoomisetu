-- Bhoomisetu - Initial Auth & Roles Schema

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_phone VARCHAR(32) UNIQUE,
  primary_email VARCHAR(255) UNIQUE,
  full_name VARCHAR(255),
  password_hash TEXT,
  firebase_uid VARCHAR(255) UNIQUE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  fraud_risk_score SMALLINT NOT NULL DEFAULT 0,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  code VARCHAR(64) NOT NULL UNIQUE,
  name VARCHAR(128) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id),
  role_id INT NOT NULL REFERENCES roles (id),
  assigned_by UUID REFERENCES users (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles (user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles (role_id);

CREATE TABLE IF NOT EXISTS login_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id),
  device_id VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  refresh_token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
  risk_score SMALLINT,
  login_provider VARCHAR(32) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_login_sessions_user_id ON login_sessions (user_id);

CREATE TABLE IF NOT EXISTS otp_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel VARCHAR(16) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  purpose VARCHAR(32) NOT NULL,
  otp_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts_count INT NOT NULL DEFAULT 0,
  max_attempts INT NOT NULL DEFAULT 5,
  is_used BOOLEAN NOT NULL DEFAULT FALSE,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  metadata JSONB,
  fraud_risk_score SMALLINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_otp_logs_destination ON otp_logs (destination);
CREATE INDEX IF NOT EXISTS idx_otp_logs_purpose ON otp_logs (purpose);

-- Seed core roles
INSERT INTO roles (code, name, description)
VALUES
  ('buyer', 'Buyer', 'End user interested in buying or renting properties'),
  ('seller', 'Seller', 'Property owner listing properties'),
  ('agent', 'Agent', 'Real estate agent acting on behalf of seller'),
  ('customer_service', 'Customer Service', 'CS agents mediating between buyers and sellers'),
  ('admin', 'Admin', 'Platform administrator with elevated privileges')
ON CONFLICT (code) DO NOTHING;

