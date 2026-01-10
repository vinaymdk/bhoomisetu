-- Bhoomisetu - Reviews & Feedback Schema (Module 11)

-- Reviews Table (Module 11)
-- Reviews can be for properties, sellers, or the overall experience
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Seller/Agent being reviewed
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL, -- Property being reviewed (optional, can review seller without property)
  interest_expression_id UUID REFERENCES interest_expressions(id) ON DELETE SET NULL, -- Link to interest expression (for viewing review)
  chat_session_id UUID REFERENCES chat_sessions(id) ON DELETE SET NULL, -- Link to chat session (for deal review)
  review_type VARCHAR(50) NOT NULL, -- 'property', 'seller', 'experience', 'deal'
  review_context VARCHAR(50), -- 'after_viewing', 'after_deal', 'after_interaction'
  
  -- Ratings
  overall_rating DECIMAL(3, 2) NOT NULL CHECK (overall_rating >= 1.0 AND overall_rating <= 5.0), -- 1.0 to 5.0
  property_rating DECIMAL(3, 2) CHECK (property_rating >= 1.0 AND property_rating <= 5.0), -- For property reviews
  seller_rating DECIMAL(3, 2) CHECK (seller_rating >= 1.0 AND seller_rating <= 5.0), -- For seller reviews
  responsiveness_rating DECIMAL(3, 2) CHECK (responsiveness_rating >= 1.0 AND responsiveness_rating <= 5.0),
  communication_rating DECIMAL(3, 2) CHECK (communication_rating >= 1.0 AND communication_rating <= 5.0),
  professionalism_rating DECIMAL(3, 2) CHECK (professionalism_rating >= 1.0 AND professionalism_rating <= 5.0),
  
  -- Review Content
  title VARCHAR(255),
  comment TEXT NOT NULL, -- Review text
  pros TEXT, -- What was good
  cons TEXT, -- What could be improved
  
  -- AI Analysis (CRITICAL)
  sentiment_score DECIMAL(5, 2), -- -1.0 (negative) to 1.0 (positive)
  sentiment_label VARCHAR(50), -- 'positive', 'negative', 'neutral', 'mixed'
  ai_analysis_performed BOOLEAN NOT NULL DEFAULT FALSE,
  ai_analysis_result JSONB, -- Detailed AI analysis (sentiment, key phrases, topics, etc.)
  fake_review_score DECIMAL(5, 2), -- 0.0 (genuine) to 1.0 (fake)
  fake_review_detected BOOLEAN NOT NULL DEFAULT FALSE,
  fake_review_reasons TEXT[], -- Reasons for fake detection (e.g., 'generic_language', 'suspicious_pattern', 'duplicate_content')
  ai_confidence DECIMAL(5, 2), -- 0.0 to 1.0
  
  -- Review Status
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'flagged', 'hidden'
  moderation_notes TEXT,
  moderated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  moderated_at TIMESTAMPTZ,
  
  -- Helpful Votes
  helpful_count INT NOT NULL DEFAULT 0,
  not_helpful_count INT NOT NULL DEFAULT 0,
  
  -- Metadata
  is_verified_purchase BOOLEAN NOT NULL DEFAULT FALSE, -- True if reviewer actually viewed/dealt
  is_anonymous BOOLEAN NOT NULL DEFAULT FALSE, -- User can choose to post anonymously
  is_edited BOOLEAN NOT NULL DEFAULT FALSE,
  edited_at TIMESTAMPTZ,
  metadata JSONB,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews (reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id ON reviews (reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_property_id ON reviews (property_id);
CREATE INDEX IF NOT EXISTS idx_reviews_interest_expression_id ON reviews (interest_expression_id);
CREATE INDEX IF NOT EXISTS idx_reviews_chat_session_id ON reviews (chat_session_id);
CREATE INDEX IF NOT EXISTS idx_reviews_review_type ON reviews (review_type);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews (status);
CREATE INDEX IF NOT EXISTS idx_reviews_overall_rating ON reviews (overall_rating);
CREATE INDEX IF NOT EXISTS idx_reviews_sentiment_score ON reviews (sentiment_score);
CREATE INDEX IF NOT EXISTS idx_reviews_fake_review_detected ON reviews (fake_review_detected);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews (created_at);
CREATE INDEX IF NOT EXISTS idx_reviews_verified_purchase ON reviews (is_verified_purchase);

-- Unique constraint: One review per reviewer-reviewee-property combination (if property specified)
-- But allow multiple reviews for different properties
CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_unique_reviewer_reviewee_property 
ON reviews (reviewer_id, reviewee_id, property_id) 
WHERE property_id IS NOT NULL AND deleted_at IS NULL;

-- Review Helpful Votes Table (Module 11)
-- Users can vote if a review is helpful or not
CREATE TABLE IF NOT EXISTS review_helpful_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_helpful BOOLEAN NOT NULL, -- true = helpful, false = not helpful
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (review_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_review_helpful_votes_review_id ON review_helpful_votes (review_id);
CREATE INDEX IF NOT EXISTS idx_review_helpful_votes_user_id ON review_helpful_votes (user_id);

-- Review Reports Table (Module 11)
-- Users can report reviews as inappropriate, fake, spam, etc.
CREATE TABLE IF NOT EXISTS review_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  report_reason VARCHAR(100) NOT NULL, -- 'fake', 'spam', 'inappropriate', 'offensive', 'misleading', 'other'
  report_details TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'reviewing', 'resolved', 'dismissed'
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_review_reports_review_id ON review_reports (review_id);
CREATE INDEX IF NOT EXISTS idx_review_reports_reported_by ON review_reports (reported_by);
CREATE INDEX IF NOT EXISTS idx_review_reports_status ON review_reports (status);

-- Review Replies Table (Module 11)
-- Sellers/Agents can reply to reviews (with moderation)
CREATE TABLE IF NOT EXISTS review_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  replied_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Must be the reviewee (seller/agent)
  reply_text TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'hidden'
  moderation_notes TEXT,
  moderated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  moderated_at TIMESTAMPTZ,
  is_edited BOOLEAN NOT NULL DEFAULT FALSE,
  edited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_review_replies_review_id ON review_replies (review_id);
CREATE INDEX IF NOT EXISTS idx_review_replies_replied_by ON review_replies (replied_by);
CREATE INDEX IF NOT EXISTS idx_review_replies_status ON review_replies (status);

-- Comments for reviewing changes
COMMENT ON TABLE reviews IS 'Reviews and ratings for properties, sellers, and overall experience. Includes AI sentiment analysis and fake review detection.';
COMMENT ON COLUMN reviews.review_type IS 'Type of review: property, seller, experience, deal';
COMMENT ON COLUMN reviews.review_context IS 'Context: after_viewing, after_deal, after_interaction';
COMMENT ON COLUMN reviews.sentiment_score IS 'AI sentiment score: -1.0 (negative) to 1.0 (positive)';
COMMENT ON COLUMN reviews.sentiment_label IS 'AI sentiment label: positive, negative, neutral, mixed';
COMMENT ON COLUMN reviews.fake_review_score IS 'AI fake review score: 0.0 (genuine) to 1.0 (fake)';
COMMENT ON COLUMN reviews.fake_review_reasons IS 'Reasons for fake detection: generic_language, suspicious_pattern, duplicate_content, etc.';
COMMENT ON COLUMN reviews.is_verified_purchase IS 'True if reviewer actually viewed the property or completed a deal (verified via interest_expression or chat_session)';
COMMENT ON TABLE review_helpful_votes IS 'Users can vote if a review is helpful or not helpful';
COMMENT ON TABLE review_reports IS 'Users can report reviews as inappropriate, fake, spam, etc.';
COMMENT ON TABLE review_replies IS 'Sellers/Agents can reply to reviews (with moderation)';
