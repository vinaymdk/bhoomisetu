-- Module 11: Reviews & Feedback - Sample Data
-- Requires module1_auth_sample_data.sql and module2_properties_sample_data.sql

INSERT INTO reviews (
  id,
  reviewer_id,
  reviewee_id,
  property_id,
  review_type,
  review_context,
  overall_rating,
  property_rating,
  seller_rating,
  responsiveness_rating,
  communication_rating,
  professionalism_rating,
  title,
  comment,
  pros,
  cons,
  sentiment_score,
  sentiment_label,
  fake_review_score,
  fake_review_detected,
  fake_review_reasons,
  ai_confidence,
  status,
  helpful_count,
  not_helpful_count,
  is_verified_purchase,
  is_anonymous,
  is_edited,
  created_at,
  updated_at
)
VALUES
  (
    '950e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440002',
    '850e8400-e29b-41d4-a716-446655440001',
    'property',
    'after_viewing',
    4.5,
    4.0,
    4.5,
    4.0,
    4.0,
    4.5,
    'Great for families',
    'Spacious and well maintained property with friendly seller support.',
    'Good location, responsive seller, clean amenities.',
    'Slightly noisy during peak hours.',
    0.65,
    'positive',
    0.08,
    FALSE,
    ARRAY['consistent_timeline'],
    0.82,
    'approved',
    2,
    0,
    TRUE,
    FALSE,
    FALSE,
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '7 days'
  ),
  (
    '950e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440002',
    '850e8400-e29b-41d4-a716-446655440002',
    'property',
    'after_viewing',
    3.6,
    3.5,
    3.4,
    3.0,
    3.5,
    3.4,
    'Decent but needs updates',
    'Good layout but the maintenance needs improvement.',
    'Nice neighborhood and easy access.',
    'Plumbing issues, needs repainting.',
    0.05,
    'neutral',
    0.18,
    FALSE,
    ARRAY['detailed_feedback'],
    0.68,
    'approved',
    1,
    1,
    TRUE,
    FALSE,
    FALSE,
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days'
  ),
  (
    '950e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440003',
    '850e8400-e29b-41d4-a716-446655440003',
    'seller',
    'after_interaction',
    4.2,
    NULL,
    4.0,
    4.5,
    4.0,
    4.2,
    'Professional guidance',
    'Agent shared detailed insights and guided us through options.',
    'Prompt replies and clear explanations.',
    'Availability was limited on weekends.',
    0.4,
    'positive',
    0.12,
    FALSE,
    ARRAY['consistent_language'],
    0.7,
    'approved',
    0,
    0,
    FALSE,
    TRUE,
    FALSE,
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO review_helpful_votes (id, review_id, user_id, is_helpful, created_at)
VALUES
  (
    '960e8400-e29b-41d4-a716-446655440010',
    '950e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440003',
    TRUE,
    NOW() - INTERVAL '6 days'
  ),
  (
    '960e8400-e29b-41d4-a716-446655440011',
    '950e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440004',
    FALSE,
    NOW() - INTERVAL '2 days'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO review_reports (id, review_id, reported_by, report_reason, report_details, status, created_at, updated_at)
VALUES
  (
    '970e8400-e29b-41d4-a716-446655440001',
    '950e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440006',
    'misleading',
    'Property condition seems inconsistent with listing photos.',
    'pending',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO review_replies (id, review_id, replied_by, reply_text, status, created_at, updated_at)
VALUES
  (
    '980e8400-e29b-41d4-a716-446655440001',
    '950e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440002',
    'Thanks for the detailed feedback. We have scheduled maintenance for the noise issue.',
    'approved',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days'
  )
ON CONFLICT (id) DO NOTHING;
