-- Module 6: Buyer Requirements sample data
-- Requires: users, roles, user_roles, buyer_requirements tables
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

WITH buyer_user AS (
  SELECT u.id
  FROM users u
  JOIN user_roles ur ON ur.user_id = u.id
  JOIN roles r ON r.id = ur.role_id
  WHERE r.name = 'buyer'
  LIMIT 1
)
INSERT INTO buyer_requirements (
  id,
  buyer_id,
  title,
  description,
  city,
  state,
  locality,
  pincode,
  landmark,
  min_budget,
  max_budget,
  budget_type,
  property_type,
  listing_type,
  min_area,
  max_area,
  area_unit,
  bedrooms,
  bathrooms,
  required_features,
  status,
  match_count,
  created_at,
  updated_at
)
SELECT
  uuid_generate_v4(),
  buyer_user.id,
  '3BHK near metro line',
  'Looking for a well-ventilated apartment close to the metro with parking.',
  'Hyderabad',
  'Telangana',
  'Kondapur',
  '500084',
  'Near Metro Station',
  4500000,
  6500000,
  'sale',
  'apartment',
  'sale',
  1100,
  1500,
  'sqft',
  3,
  2,
  '["parking","lift","east-facing"]'::jsonb,
  'active',
  0,
  NOW(),
  NOW()
FROM buyer_user;

WITH buyer_user AS (
  SELECT u.id
  FROM users u
  JOIN user_roles ur ON ur.user_id = u.id
  JOIN roles r ON r.id = ur.role_id
  WHERE r.name = 'buyer'
  LIMIT 1
)
INSERT INTO buyer_requirements (
  id,
  buyer_id,
  title,
  description,
  city,
  state,
  locality,
  min_budget,
  max_budget,
  budget_type,
  property_type,
  listing_type,
  min_area,
  max_area,
  area_unit,
  bedrooms,
  bathrooms,
  required_features,
  status,
  match_count,
  created_at,
  updated_at
)
SELECT
  uuid_generate_v4(),
  buyer_user.id,
  'Rental office space',
  'Commercial space with good road visibility.',
  'Bengaluru',
  'Karnataka',
  'Indiranagar',
  35000,
  55000,
  'rent',
  'commercial',
  'rent',
  700,
  1200,
  'sqft',
  NULL,
  1,
  '["power-backup","washroom"]'::jsonb,
  'active',
  0,
  NOW(),
  NOW()
FROM buyer_user;

