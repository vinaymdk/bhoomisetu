-- Module 7: Mediation & Negotiation sample data
-- Requires: users, roles, user_roles, properties, interest_expressions tables
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

WITH buyer_user AS (
  SELECT u.id
  FROM users u
  JOIN user_roles ur ON ur.user_id = u.id
  JOIN roles r ON r.id = ur.role_id
  WHERE r.name = 'buyer'
  LIMIT 1
),
seller_property AS (
  SELECT p.id, p.seller_id
  FROM properties p
  WHERE p.deleted_at IS NULL
  ORDER BY p.created_at DESC
  LIMIT 1
)
INSERT INTO interest_expressions (
  id,
  buyer_id,
  property_id,
  message,
  interest_type,
  priority,
  connection_status,
  created_at,
  updated_at
)
SELECT
  uuid_generate_v4(),
  buyer_user.id,
  seller_property.id,
  'Interested in viewing this property next week.',
  'viewing',
  'normal',
  'pending',
  NOW(),
  NOW()
FROM buyer_user, seller_property;

