-- Bhoomisetu - Properties Schema (Module 2)

-- Property types enum
CREATE TYPE property_type_enum AS ENUM (
  'apartment',
  'house',
  'villa',
  'plot',
  'commercial',
  'office',
  'shop',
  'warehouse',
  'agricultural',
  'other'
);

-- Listing type enum
CREATE TYPE listing_type_enum AS ENUM ('sale', 'rent');

-- Property status enum
CREATE TYPE property_status_enum AS ENUM (
  'draft',
  'pending_verification',
  'verified',
  'live',
  'sold',
  'rented',
  'expired',
  'rejected'
);

-- Main properties table
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES users (id),
  
  -- Basic Info
  property_type property_type_enum NOT NULL,
  listing_type listing_type_enum NOT NULL,
  status property_status_enum NOT NULL DEFAULT 'draft',
  
  -- Location
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  pincode VARCHAR(20),
  locality VARCHAR(200),
  landmark VARCHAR(200),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Property Details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(15, 2) NOT NULL,
  area DECIMAL(10, 2) NOT NULL, -- in sqft
  area_unit VARCHAR(10) DEFAULT 'sqft',
  bedrooms INT,
  bathrooms INT,
  balconies INT,
  floors INT, -- Total floors in building
  floor_number INT, -- Floor number of this property
  furnishing_status VARCHAR(50), -- furnished, semi-furnished, unfurnished
  age_of_construction INT, -- in years
  
  -- Additional Features (stored as JSON for flexibility)
  features JSONB, -- e.g., {"parking": true, "lift": true, "security": true}
  
  -- Verification (Module 5)
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES users (id), -- CS agent
  rejection_reason TEXT,
  
  -- Premium Features
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_premium BOOLEAN NOT NULL DEFAULT FALSE,
  featured_until TIMESTAMPTZ, -- Premium listing expiration
  
  -- Metadata
  views_count INT NOT NULL DEFAULT 0,
  interested_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_properties_seller_id ON properties (seller_id);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties (status);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties (city);
CREATE INDEX IF NOT EXISTS idx_properties_listing_type ON properties (listing_type);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON properties (property_type);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties (price);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_properties_is_featured ON properties (is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties USING GIST (
  point(longitude, latitude)
) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Property images table
CREATE TABLE IF NOT EXISTS property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties (id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_type VARCHAR(50) DEFAULT 'photo', -- photo, floor_plan, virtual_tour, etc.
  display_order INT NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON property_images (property_id);
CREATE INDEX IF NOT EXISTS idx_property_images_display_order ON property_images (property_id, display_order);

-- Property features/amenities table (structured alternative to JSONB)
CREATE TABLE IF NOT EXISTS property_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties (id) ON DELETE CASCADE,
  feature_key VARCHAR(100) NOT NULL, -- e.g., 'parking', 'lift', 'security', 'swimming_pool'
  feature_value TEXT, -- e.g., 'covered', '2 wheeler + 4 wheeler', or just presence indicator
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(property_id, feature_key)
);

CREATE INDEX IF NOT EXISTS idx_property_features_property_id ON property_features (property_id);
CREATE INDEX IF NOT EXISTS idx_property_features_key ON property_features (feature_key);

-- Subscriptions table (for premium features)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id),
  subscription_type VARCHAR(50) NOT NULL, -- 'premium_seller', 'premium_buyer', 'featured_listing'
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, expired, cancelled
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  payment_id VARCHAR(255), -- Reference to payment transaction
  amount_paid DECIMAL(10, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions (user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions (status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires_at ON subscriptions (expires_at);

-- Property verification notes table (Module 5 - Customer Service)
CREATE TABLE IF NOT EXISTS property_verification_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties (id),
  cs_agent_id UUID NOT NULL REFERENCES users (id),
  urgency_level VARCHAR(20) NOT NULL DEFAULT 'normal', -- low, normal, high, urgent
  negotiation_notes TEXT,
  remarks TEXT,
  verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_property_verification_notes_property_id ON property_verification_notes (property_id);
CREATE INDEX IF NOT EXISTS idx_property_verification_notes_cs_agent_id ON property_verification_notes (cs_agent_id);

-- Comments/Notes
COMMENT ON TABLE properties IS 'Main property listings table. Properties go through draft -> pending_verification -> verified -> live workflow.';
COMMENT ON COLUMN properties.is_featured IS 'Featured properties appear prominently. Requires premium subscription.';
COMMENT ON COLUMN properties.featured_until IS 'Expiration date for featured listing. NULL means permanent or subscription-based.';
COMMENT ON COLUMN properties.status IS 'Workflow: draft (seller editing) -> pending_verification (submitted) -> verified (CS approved) -> live (visible to buyers)';
