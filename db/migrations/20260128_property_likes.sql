-- Bhoomisetu - Property Likes (Module 11 UI enhancement)
CREATE TABLE IF NOT EXISTS property_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (property_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_property_likes_property_id ON property_likes(property_id);
CREATE INDEX IF NOT EXISTS idx_property_likes_user_id ON property_likes(user_id);
