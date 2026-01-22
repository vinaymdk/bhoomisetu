-- Module 5: Customer Service Verification Sample Data
-- Requires module1_auth_sample_data.sql to be loaded first.

-- Insert sample properties in pending verification state
INSERT INTO properties (
  id,
  seller_id,
  property_type,
  listing_type,
  status,
  address,
  city,
  state,
  pincode,
  locality,
  landmark,
  latitude,
  longitude,
  title,
  description,
  price,
  area,
  area_unit,
  bedrooms,
  bathrooms,
  created_at,
  updated_at
)
VALUES
  (
    'e5b3c4c2-47b3-4e90-97f3-8a6a4f6a9001',
    '550e8400-e29b-41d4-a716-446655440002',
    'apartment',
    'sale',
    'pending_verification',
    'Plot 12, Sector 9, Hitech City',
    'Hyderabad',
    'Telangana',
    '500081',
    'Hitech City',
    'Near metro station',
    17.4467,
    78.3762,
    'Ready 2BHK in Hitech City',
    'Well-lit apartment with balcony and covered parking.',
    5800000,
    1080,
    'sqft',
    2,
    2,
    NOW(),
    NOW()
  ),
  (
    'e5b3c4c2-47b3-4e90-97f3-8a6a4f6a9002',
    '550e8400-e29b-41d4-a716-446655440002',
    'villa',
    'sale',
    'pending_verification',
    '22 Palm Avenue, Gachibowli',
    'Hyderabad',
    'Telangana',
    '500032',
    'Gachibowli',
    'Opp. IT Park',
    17.4401,
    78.3489,
    'Premium 3BHK Villa',
    'Gated community, power backup, clubhouse access.',
    16500000,
    2200,
    'sqft',
    3,
    3,
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- Insert sample images
INSERT INTO property_images (property_id, image_url, image_type, display_order, is_primary, created_at)
VALUES
  ('e5b3c4c2-47b3-4e90-97f3-8a6a4f6a9001', 'https://picsum.photos/seed/bs-cs-1/800/600', 'photo', 0, true, NOW()),
  ('e5b3c4c2-47b3-4e90-97f3-8a6a4f6a9001', 'https://picsum.photos/seed/bs-cs-2/800/600', 'photo', 1, false, NOW()),
  ('e5b3c4c2-47b3-4e90-97f3-8a6a4f6a9002', 'https://picsum.photos/seed/bs-cs-3/800/600', 'photo', 0, true, NOW()),
  ('e5b3c4c2-47b3-4e90-97f3-8a6a4f6a9002', 'https://picsum.photos/seed/bs-cs-4/800/600', 'photo', 1, false, NOW())
ON CONFLICT DO NOTHING;

-- Insert sample verification notes (optional historical notes)
INSERT INTO property_verification_notes (
  property_id,
  cs_agent_id,
  urgency_level,
  negotiation_notes,
  remarks,
  verified_at,
  created_at
)
VALUES
  (
    'e5b3c4c2-47b3-4e90-97f3-8a6a4f6a9001',
    '550e8400-e29b-41d4-a716-446655440005',
    'normal',
    'Seller open to 3-5% negotiation.',
    'Initial document check completed.',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
  )
ON CONFLICT DO NOTHING;
