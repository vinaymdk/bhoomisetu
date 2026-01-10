-- Buyer Requirements table (Module 6)
CREATE TABLE IF NOT EXISTS buyer_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  title VARCHAR(255),
  description TEXT,
  
  -- Location
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  locality VARCHAR(200),
  pincode VARCHAR(20),
  landmark VARCHAR(200),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Budget (for both sale and rent)
  min_budget DECIMAL(15, 2),
  max_budget DECIMAL(15, 2) NOT NULL,
  budget_type VARCHAR(20) NOT NULL DEFAULT 'sale', -- 'sale' or 'rent'
  
  -- Property Details
  property_type VARCHAR(50), -- apartment, house, villa, plot, commercial, etc.
  listing_type VARCHAR(20), -- 'sale' or 'rent'
  
  -- Specific Requirements
  min_area DECIMAL(10, 2),
  max_area DECIMAL(10, 2),
  area_unit VARCHAR(10) DEFAULT 'sqft',
  bedrooms INT,
  bathrooms INT,
  
  -- Required Features (JSONB for flexibility)
  required_features JSONB, -- Array of feature keys like ['parking', 'lift', 'security']
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'fulfilled', 'cancelled', 'expired'
  
  -- Matching & Notifications
  match_count INT DEFAULT 0, -- Number of properties matched
  last_matched_at TIMESTAMPTZ, -- Last time a match was found
  
  -- Expiry (requirements can expire)
  expires_at TIMESTAMPTZ, -- NULL means no expiration
  
  -- Metadata
  metadata JSONB, -- Additional flexible data
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes for buyer_requirements
CREATE INDEX IF NOT EXISTS idx_buyer_requirements_buyer_id ON buyer_requirements (buyer_id);
CREATE INDEX IF NOT EXISTS idx_buyer_requirements_status ON buyer_requirements (status);
CREATE INDEX IF NOT EXISTS idx_buyer_requirements_city ON buyer_requirements (city);
CREATE INDEX IF NOT EXISTS idx_buyer_requirements_property_type ON buyer_requirements (property_type);
CREATE INDEX IF NOT EXISTS idx_buyer_requirements_listing_type ON buyer_requirements (listing_type);
CREATE INDEX IF NOT EXISTS idx_buyer_requirements_budget ON buyer_requirements (min_budget, max_budget);
CREATE INDEX IF NOT EXISTS idx_buyer_requirements_expires_at ON buyer_requirements (expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_buyer_requirements_deleted_at ON buyer_requirements (deleted_at) WHERE deleted_at IS NULL;

-- Property-Requirement Matches table (tracks matches for AI matching system)
CREATE TABLE IF NOT EXISTS property_requirement_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_requirement_id UUID NOT NULL REFERENCES buyer_requirements (id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties (id) ON DELETE CASCADE,
  
  -- Match Scores (AI computed)
  location_match_score DECIMAL(5, 2) DEFAULT 0, -- 0-100
  budget_match_score DECIMAL(5, 2) DEFAULT 0, -- 0-100 (80%+ overlap = good match)
  overall_match_score DECIMAL(5, 2) DEFAULT 0, -- 0-100 (weighted combination)
  
  -- Match Details
  budget_overlap_percentage DECIMAL(5, 2), -- Percentage of budget overlap
  location_match_type VARCHAR(50), -- 'exact_city', 'same_locality', 'nearby', etc.
  match_reasons JSONB, -- Array of reasons why this matched
  
  -- Notification Status
  notified_seller BOOLEAN DEFAULT false,
  notified_buyer BOOLEAN DEFAULT false,
  notified_cs BOOLEAN DEFAULT false,
  notified_at TIMESTAMPTZ,
  
  -- Buyer Interest (Module 7 - placeholder)
  buyer_interested BOOLEAN DEFAULT false,
  buyer_interested_at TIMESTAMPTZ,
  
  -- CS Action (Module 7 - placeholder)
  cs_reviewed BOOLEAN DEFAULT false,
  cs_reviewed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(buyer_requirement_id, property_id)
);

-- Indexes for property_requirement_matches
CREATE INDEX IF NOT EXISTS idx_property_requirement_matches_requirement_id ON property_requirement_matches (buyer_requirement_id);
CREATE INDEX IF NOT EXISTS idx_property_requirement_matches_property_id ON property_requirement_matches (property_id);
CREATE INDEX IF NOT EXISTS idx_property_requirement_matches_overall_score ON property_requirement_matches (overall_match_score DESC);
CREATE INDEX IF NOT EXISTS idx_property_requirement_matches_budget_overlap ON property_requirement_matches (budget_overlap_percentage DESC);
CREATE INDEX IF NOT EXISTS idx_property_requirement_matches_notified ON property_requirement_matches (notified_buyer, notified_seller, notified_cs);

-- Comments
COMMENT ON TABLE buyer_requirements IS 'Buyer property requirements for matching with properties. Triggers AI matching when new properties are added or requirements are created.';
COMMENT ON TABLE property_requirement_matches IS 'Matches between buyer requirements and properties. Tracks match scores, notifications, and buyer interest (for Module 7).';
COMMENT ON COLUMN buyer_requirements.budget_overlap_percentage IS 'Percentage overlap between requirement budget and property price. >=80% is considered a good match.';
COMMENT ON COLUMN property_requirement_matches.budget_overlap_percentage IS 'Calculated percentage: (overlap_range / requirement_budget_range) * 100. >=80% triggers notification.';
