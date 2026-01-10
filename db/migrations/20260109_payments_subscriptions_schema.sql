-- Payments & Subscriptions Module (Module 10)
-- Premium Features: Priority listing, Faster mediation, Featured badge
-- Payment Gateway: Razorpay / Stripe
-- AI Checks: Fraud detection, Duplicate cards, Location mismatch

-- Subscription Plans table (predefined subscription plans)
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Plan Details
  name VARCHAR(100) NOT NULL UNIQUE, -- e.g., 'premium_seller_monthly', 'premium_buyer_annual', 'featured_listing'
  display_name VARCHAR(255) NOT NULL, -- e.g., 'Premium Seller (Monthly)', 'Premium Buyer (Annual)'
  description TEXT,
  
  -- Plan Type
  plan_type VARCHAR(50) NOT NULL, -- 'premium_seller', 'premium_buyer', 'featured_listing'
  billing_period VARCHAR(20) NOT NULL, -- 'monthly', 'quarterly', 'annual', 'one_time'
  
  -- Pricing
  price DECIMAL(10, 2) NOT NULL, -- Price in INR
  currency VARCHAR(3) DEFAULT 'INR',
  
  -- Features (JSONB for flexibility)
  features JSONB NOT NULL, -- { priority_listing: true, faster_mediation: true, featured_badge: true, advanced_search: true, property_alerts: true }
  
  -- Validity
  duration_days INT NOT NULL, -- Number of days subscription is valid (30, 90, 365, etc.)
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false, -- Featured plans shown prominently
  
  -- Metadata
  metadata JSONB, -- Additional plan metadata (discounts, promotions, etc.)
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for subscription_plans
CREATE INDEX IF NOT EXISTS idx_subscription_plans_name ON subscription_plans (name);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_plan_type ON subscription_plans (plan_type);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_billing_period ON subscription_plans (billing_period);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans (is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_subscription_plans_featured ON subscription_plans (is_featured) WHERE is_featured = true;

-- Payment Methods table (user's saved payment methods)
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  
  -- Payment Gateway
  gateway VARCHAR(50) NOT NULL, -- 'razorpay', 'stripe'
  gateway_payment_method_id VARCHAR(255) NOT NULL, -- Payment method ID from gateway (e.g., Razorpay card_id, Stripe payment_method_id)
  
  -- Card Details (masked, stored securely)
  card_last4 VARCHAR(4), -- Last 4 digits of card
  card_brand VARCHAR(50), -- 'visa', 'mastercard', 'rupay', etc.
  card_type VARCHAR(20), -- 'credit', 'debit', 'prepaid'
  card_expiry_month INT, -- 1-12
  card_expiry_year INT, -- YYYY (e.g., 2026)
  
  -- Billing Address
  billing_name VARCHAR(255),
  billing_email VARCHAR(255),
  billing_phone VARCHAR(20),
  billing_address_line1 TEXT,
  billing_address_line2 TEXT,
  billing_city VARCHAR(100),
  billing_state VARCHAR(100),
  billing_country VARCHAR(100) DEFAULT 'India',
  billing_pincode VARCHAR(20),
  
  -- Status
  is_default BOOLEAN DEFAULT false, -- Default payment method for user
  is_active BOOLEAN DEFAULT true,
  
  -- AI Risk Checks
  fraud_risk_score SMALLINT DEFAULT 0, -- From AI fraud detection
  duplicate_card_flagged BOOLEAN DEFAULT false, -- Flagged by AI for duplicate card across accounts
  location_mismatch_flagged BOOLEAN DEFAULT false, -- Flagged by AI for billing address mismatch with user location
  
  -- Metadata
  metadata JSONB, -- Gateway response, additional card details, etc.
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for payment_methods
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods (user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_gateway ON payment_methods (gateway);
CREATE INDEX IF NOT EXISTS idx_payment_methods_gateway_id ON payment_methods (gateway_payment_method_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_default ON payment_methods (user_id, is_default) WHERE is_default = true;
CREATE INDEX IF NOT EXISTS idx_payment_methods_active ON payment_methods (is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_payment_methods_fraud_risk ON payment_methods (fraud_risk_score) WHERE fraud_risk_score > 50;
CREATE INDEX IF NOT EXISTS idx_payment_methods_duplicate_flagged ON payment_methods (duplicate_card_flagged) WHERE duplicate_card_flagged = true;
CREATE INDEX IF NOT EXISTS idx_payment_methods_location_flagged ON payment_methods (location_mismatch_flagged) WHERE location_mismatch_flagged = true;

-- Payments table (all payment transactions)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  
  -- Payment Details
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  
  -- Payment Gateway
  gateway VARCHAR(50) NOT NULL, -- 'razorpay', 'stripe'
  gateway_order_id VARCHAR(255), -- Gateway order ID (Razorpay order_id, Stripe payment_intent_id)
  gateway_payment_id VARCHAR(255), -- Gateway payment ID (Razorpay payment_id, Stripe charge_id)
  gateway_signature VARCHAR(500), -- Gateway webhook signature for verification
  
  -- Payment Method
  payment_method_id UUID REFERENCES payment_methods (id) ON DELETE SET NULL,
  
  -- Payment Status
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'
  
  -- Payment Purpose
  purpose VARCHAR(50) NOT NULL, -- 'subscription', 'featured_listing', 'priority_mediation', 'one_time_feature'
  related_entity_type VARCHAR(50), -- 'subscription', 'property', 'mediation_request'
  related_entity_id UUID, -- ID of related subscription, property, etc.
  
  -- AI Risk Checks
  fraud_risk_score SMALLINT DEFAULT 0, -- From AI fraud detection
  duplicate_card_detected BOOLEAN DEFAULT false, -- AI detected duplicate card
  location_mismatch_detected BOOLEAN DEFAULT false, -- AI detected location mismatch
  ai_check_performed BOOLEAN DEFAULT false, -- Whether AI check was performed
  ai_check_result JSONB, -- Full AI check result
  
  -- Payment Metadata
  metadata JSONB, -- Gateway response, additional payment details, etc.
  failure_reason TEXT, -- Reason for payment failure
  
  -- Timestamps
  initiated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for payments
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments (user_id);
CREATE INDEX IF NOT EXISTS idx_payments_gateway_order_id ON payments (gateway_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_gateway_payment_id ON payments (gateway_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments (status);
CREATE INDEX IF NOT EXISTS idx_payments_purpose ON payments (purpose);
CREATE INDEX IF NOT EXISTS idx_payments_related_entity ON payments (related_entity_type, related_entity_id) WHERE related_entity_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_fraud_risk ON payments (fraud_risk_score) WHERE fraud_risk_score > 50;
CREATE INDEX IF NOT EXISTS idx_payments_duplicate_detected ON payments (duplicate_card_detected) WHERE duplicate_card_detected = true;
CREATE INDEX IF NOT EXISTS idx_payments_location_mismatch ON payments (location_mismatch_detected) WHERE location_mismatch_detected = true;

-- Subscription Transactions table (links payments to subscriptions)
CREATE TABLE IF NOT EXISTS subscription_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES subscriptions (id) ON DELETE CASCADE,
  payment_id UUID NOT NULL REFERENCES payments (id) ON DELETE RESTRICT,
  subscription_plan_id UUID NOT NULL REFERENCES subscription_plans (id) ON DELETE RESTRICT,
  
  -- Transaction Details
  transaction_type VARCHAR(50) NOT NULL, -- 'initial_purchase', 'renewal', 'upgrade', 'downgrade', 'extension'
  
  -- Amount Details
  amount_paid DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  
  -- Period Covered
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  
  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
  
  -- Auto-renewal
  auto_renewal_enabled BOOLEAN DEFAULT false,
  next_billing_date TIMESTAMPTZ, -- Next auto-renewal date
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for subscription_transactions
CREATE INDEX IF NOT EXISTS idx_subscription_transactions_subscription_id ON subscription_transactions (subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_transactions_payment_id ON subscription_transactions (payment_id);
CREATE INDEX IF NOT EXISTS idx_subscription_transactions_plan_id ON subscription_transactions (subscription_plan_id);
CREATE INDEX IF NOT EXISTS idx_subscription_transactions_status ON subscription_transactions (status);
CREATE INDEX IF NOT EXISTS idx_subscription_transactions_auto_renewal ON subscription_transactions (auto_renewal_enabled, next_billing_date) WHERE auto_renewal_enabled = true;

-- Enhanced Subscriptions table (extends existing subscriptions table)
-- Note: Existing subscriptions table is in 20260109_properties_schema.sql
-- Add missing columns if needed

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS subscription_plan_id UUID REFERENCES subscription_plans (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS auto_renewal_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS next_billing_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
  ADD COLUMN IF NOT EXISTS payment_method_id UUID REFERENCES payment_methods (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Indexes for enhanced subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON subscriptions (subscription_plan_id) WHERE subscription_plan_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_subscriptions_auto_renewal ON subscriptions (auto_renewal_enabled, next_billing_date) WHERE auto_renewal_enabled = true;
CREATE INDEX IF NOT EXISTS idx_subscriptions_payment_method ON subscriptions (payment_method_id) WHERE payment_method_id IS NOT NULL;

-- Payment Webhooks table (for tracking webhook events from payment gateways)
CREATE TABLE IF NOT EXISTS payment_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Webhook Details
  gateway VARCHAR(50) NOT NULL, -- 'razorpay', 'stripe'
  event_type VARCHAR(100) NOT NULL, -- 'payment.captured', 'payment.failed', 'order.paid', 'payment_intent.succeeded', etc.
  event_id VARCHAR(255) NOT NULL, -- Event ID from gateway
  
  -- Payment Reference
  payment_id UUID REFERENCES payments (id) ON DELETE SET NULL,
  gateway_order_id VARCHAR(255),
  gateway_payment_id VARCHAR(255),
  
  -- Webhook Payload
  payload JSONB NOT NULL, -- Full webhook payload from gateway
  signature VARCHAR(500), -- Webhook signature for verification
  
  -- Processing Status
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  processing_error TEXT,
  
  -- Retry Logic
  retry_count INT DEFAULT 0,
  max_retries INT DEFAULT 3,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for payment_webhooks
CREATE INDEX IF NOT EXISTS idx_payment_webhooks_gateway ON payment_webhooks (gateway);
CREATE INDEX IF NOT EXISTS idx_payment_webhooks_event_id ON payment_webhooks (event_id);
CREATE INDEX IF NOT EXISTS idx_payment_webhooks_payment_id ON payment_webhooks (payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_webhooks_processed ON payment_webhooks (processed) WHERE processed = false;
CREATE INDEX IF NOT EXISTS idx_payment_webhooks_created_at ON payment_webhooks (created_at DESC);

-- Comments
COMMENT ON TABLE subscription_plans IS 'Predefined subscription plans with pricing and features. Plans can be monthly, quarterly, annual, or one-time.';
COMMENT ON TABLE payment_methods IS 'User saved payment methods (cards) from Razorpay/Stripe. Includes AI fraud detection flags.';
COMMENT ON TABLE payments IS 'All payment transactions. Includes AI fraud checks (fraud detection, duplicate cards, location mismatch).';
COMMENT ON TABLE subscription_transactions IS 'Links payments to subscriptions. Tracks subscription purchases, renewals, upgrades, downgrades.';
COMMENT ON TABLE payment_webhooks IS 'Webhook events from payment gateways (Razorpay/Stripe) for payment status updates.';
COMMENT ON COLUMN payment_methods.duplicate_card_flagged IS 'Flagged by AI if same card used across multiple accounts (fraud indicator).';
COMMENT ON COLUMN payment_methods.location_mismatch_flagged IS 'Flagged by AI if billing address location does not match user location (fraud indicator).';
COMMENT ON COLUMN payments.fraud_risk_score IS 'AI fraud risk score (0-100). Higher score indicates higher risk.';
COMMENT ON COLUMN payments.duplicate_card_detected IS 'AI detected duplicate card usage across accounts.';
COMMENT ON COLUMN payments.location_mismatch_detected IS 'AI detected location mismatch between billing address and user location.';

-- Seed default subscription plans
INSERT INTO subscription_plans (name, display_name, description, plan_type, billing_period, price, currency, features, duration_days, is_active, is_featured)
VALUES
  ('premium_seller_monthly', 'Premium Seller (Monthly)', 'Priority listing, faster mediation, featured badge for 30 days', 'premium_seller', 'monthly', 999.00, 'INR', 
   '{"priority_listing": true, "faster_mediation": true, "featured_badge": true, "property_alerts": false, "advanced_search": false}', 
   30, true, true),
  
  ('premium_seller_quarterly', 'Premium Seller (Quarterly)', 'Priority listing, faster mediation, featured badge for 90 days (Save 10%)', 'premium_seller', 'quarterly', 2697.30, 'INR', 
   '{"priority_listing": true, "faster_mediation": true, "featured_badge": true, "property_alerts": false, "advanced_search": false}', 
   90, true, true),
  
  ('premium_seller_annual', 'Premium Seller (Annual)', 'Priority listing, faster mediation, featured badge for 365 days (Save 15%)', 'premium_seller', 'annual', 10179.15, 'INR', 
   '{"priority_listing": true, "faster_mediation": true, "featured_badge": true, "property_alerts": false, "advanced_search": false}', 
   365, true, true),
  
  ('premium_buyer_monthly', 'Premium Buyer (Monthly)', 'Faster mediation, advanced search, property alerts for 30 days', 'premium_buyer', 'monthly', 499.00, 'INR', 
   '{"priority_listing": false, "faster_mediation": true, "featured_badge": false, "property_alerts": true, "advanced_search": true}', 
   30, true, true),
  
  ('premium_buyer_quarterly', 'Premium Buyer (Quarterly)', 'Faster mediation, advanced search, property alerts for 90 days (Save 10%)', 'premium_buyer', 'quarterly', 1347.30, 'INR', 
   '{"priority_listing": false, "faster_mediation": true, "featured_badge": false, "property_alerts": true, "advanced_search": true}', 
   90, true, true),
  
  ('premium_buyer_annual', 'Premium Buyer (Annual)', 'Faster mediation, advanced search, property alerts for 365 days (Save 15%)', 'premium_buyer', 'annual', 5081.15, 'INR', 
   '{"priority_listing": false, "faster_mediation": true, "featured_badge": false, "property_alerts": true, "advanced_search": true}', 
   365, true, true),
  
  ('featured_listing_monthly', 'Featured Listing (Monthly)', 'Featured badge for one property for 30 days', 'featured_listing', 'monthly', 499.00, 'INR', 
   '{"priority_listing": false, "faster_mediation": false, "featured_badge": true, "property_alerts": false, "advanced_search": false}', 
   30, true, false),
  
  ('featured_listing_quarterly', 'Featured Listing (Quarterly)', 'Featured badge for one property for 90 days (Save 10%)', 'featured_listing', 'quarterly', 1347.30, 'INR', 
   '{"priority_listing": false, "faster_mediation": false, "featured_badge": true, "property_alerts": false, "advanced_search": false}', 
   90, true, false),
  
  ('featured_listing_annual', 'Featured Listing (Annual)', 'Featured badge for one property for 365 days (Save 15%)', 'featured_listing', 'annual', 5081.15, 'INR', 
   '{"priority_listing": false, "faster_mediation": false, "featured_badge": true, "property_alerts": false, "advanced_search": false}', 
   365, true, false)
ON CONFLICT (name) DO NOTHING;
