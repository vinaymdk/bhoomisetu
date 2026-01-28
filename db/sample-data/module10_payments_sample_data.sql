-- Module 10: Payments & Subscriptions sample data
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
DECLARE
  v_user UUID;
  v_plan UUID;
  v_payment_method UUID;
  v_payment UUID;
  v_subscription UUID;
BEGIN
  SELECT id INTO v_user FROM users ORDER BY created_at ASC LIMIT 1;

  IF v_user IS NULL THEN
    RAISE NOTICE 'No users found. Skipping module10 sample data.';
    RETURN;
  END IF;

  SELECT id INTO v_plan FROM subscription_plans WHERE name = 'premium_seller_monthly' LIMIT 1;

  IF v_plan IS NULL THEN
    INSERT INTO subscription_plans (
      name,
      display_name,
      description,
      plan_type,
      billing_period,
      price,
      currency,
      features,
      duration_days,
      is_active,
      is_featured
    )
    VALUES (
      'premium_seller_monthly',
      'Premium Seller (Monthly)',
      'Priority listing and faster mediation for sellers.',
      'premium_seller',
      'monthly',
      1999.00,
      'INR',
      '{"priority_listing": true, "faster_mediation": true, "featured_badge": true}',
      30,
      true,
      true
    )
    RETURNING id INTO v_plan;
  END IF;

  INSERT INTO payment_methods (
    user_id,
    gateway,
    gateway_payment_method_id,
    card_last4,
    card_brand,
    card_type,
    card_expiry_month,
    card_expiry_year,
    billing_name,
    billing_email,
    billing_phone,
    billing_city,
    billing_state,
    billing_country,
    billing_pincode,
    is_default
  )
  VALUES (
    v_user,
    'razorpay',
    'card_demo_123',
    '4242',
    'visa',
    'credit',
    12,
    2027,
    'Demo User',
    'demo@bhoomisetu.com',
    '+91-9000000000',
    'Hyderabad',
    'Telangana',
    'India',
    '500001',
    true
  )
  RETURNING id INTO v_payment_method;

  INSERT INTO payments (
    user_id,
    amount,
    currency,
    gateway,
    gateway_order_id,
    gateway_payment_id,
    payment_method_id,
    status,
    purpose,
    related_entity_type,
    fraud_risk_score,
    ai_check_performed,
    metadata,
    completed_at
  )
  VALUES (
    v_user,
    1999.00,
    'INR',
    'razorpay',
    'order_demo_001',
    'pay_demo_001',
    v_payment_method,
    'completed',
    'subscription',
    'subscription',
    0,
    true,
    '{"note": "sample payment"}',
    NOW()
  )
  RETURNING id INTO v_payment;

  INSERT INTO subscriptions (
    user_id,
    subscription_type,
    status,
    starts_at,
    expires_at,
    payment_id,
    amount_paid,
    subscription_plan_id,
    auto_renewal_enabled,
    next_billing_date,
    payment_method_id,
    metadata
  )
  VALUES (
    v_user,
    'premium_seller',
    'active',
    NOW(),
    NOW() + INTERVAL '30 days',
    v_payment::text,
    1999.00,
    v_plan,
    true,
    NOW() + INTERVAL '30 days',
    v_payment_method,
    '{"source": "sample_data"}'
  )
  RETURNING id INTO v_subscription;

  UPDATE payments
  SET related_entity_id = v_subscription
  WHERE id = v_payment;

  INSERT INTO subscription_transactions (
    subscription_id,
    payment_id,
    subscription_plan_id,
    transaction_type,
    amount_paid,
    currency,
    period_start,
    period_end,
    status,
    auto_renewal_enabled,
    next_billing_date
  )
  VALUES (
    v_subscription,
    v_payment,
    v_plan,
    'initial_purchase',
    1999.00,
    'INR',
    NOW(),
    NOW() + INTERVAL '30 days',
    'completed',
    true,
    NOW() + INTERVAL '30 days'
  );
END $$;
