-- Module 4: Seller Property Listing - Sample Data (Features)
-- Adds structured features for existing sample properties.
-- Requires: module2_properties_sample_data.sql + module3_search_sample_data.sql

-- Property Features for prop-001 (Featured Apartment)
INSERT INTO property_features (property_id, feature_key, feature_value, created_at)
VALUES
  ('850e8400-e29b-41d4-a716-446655440001', 'parking', '1 car', NOW()),
  ('850e8400-e29b-41d4-a716-446655440001', 'lift', 'yes', NOW()),
  ('850e8400-e29b-41d4-a716-446655440001', 'power_backup', 'yes', NOW()),
  ('850e8400-e29b-41d4-a716-446655440001', 'security', '24x7', NOW())
ON CONFLICT (property_id, feature_key) DO NOTHING;

-- Property Features for prop-search-001 (Beach View Apartment)
INSERT INTO property_features (property_id, feature_key, feature_value, created_at)
VALUES
  ('850e8400-e29b-41d4-a716-446655440007', 'beach_view', 'yes', NOW()),
  ('850e8400-e29b-41d4-a716-446655440007', 'balcony', '2', NOW()),
  ('850e8400-e29b-41d4-a716-446655440007', 'gated_community', 'yes', NOW())
ON CONFLICT (property_id, feature_key) DO NOTHING;

-- Property Features for prop-004 (Commercial Space)
INSERT INTO property_features (property_id, feature_key, feature_value, created_at)
VALUES
  ('850e8400-e29b-41d4-a716-446655440004', 'washrooms', '2', NOW()),
  ('850e8400-e29b-41d4-a716-446655440004', 'floor', '2', NOW()),
  ('850e8400-e29b-41d4-a716-446655440004', 'power_backup', 'yes', NOW())
ON CONFLICT (property_id, feature_key) DO NOTHING;


