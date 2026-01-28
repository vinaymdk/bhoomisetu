# Sample Data Files - Setup Guide

This directory contains SQL sample data files for testing different modules of the Bhoomisetu application.

## Files Overview

1. **module1_auth_sample_data.sql** - Authentication and user management data
2. **module2_properties_sample_data.sql** - Property listings for home page testing
3. **module3_search_sample_data.sql** - Additional properties for search functionality testing
4. **module4_listing_features_sample_data.sql** - Structured property features for listings (Module 4)
5. **module9_notifications_sample_data.sql** - Notification templates and sample notifications (Module 9)
6. **module9_support_chat_sample_data.sql** - Support chat sessions/messages (Module 9)
7. **module10_payments_sample_data.sql** - Payments & subscriptions sample data (Module 10)

## Prerequisites

- PostgreSQL database running
- Database schema already created (from migrations)
- Access to the database with INSERT permissions

## Setup Instructions

### Option 1: Using psql Command Line

```bash
# Connect to your database
psql -U your_username -d bhoomisetu_db

# Run the SQL files in order
\i db/sample-data/module1_auth_sample_data.sql
\i db/sample-data/module2_properties_sample_data.sql
\i db/sample-data/module3_search_sample_data.sql
```

### Option 2: Using psql with File Input

```bash
# Run files individually
psql -U your_username -d bhoomisetu_db -f db/sample-data/module1_auth_sample_data.sql
psql -U your_username -d bhoomisetu_db -f db/sample-data/module2_properties_sample_data.sql
psql -U your_username -d bhoomisetu_db -f db/sample-data/module3_search_sample_data.sql
psql -U your_username -d bhoomisetu_db -f db/sample-data/module4_listing_features_sample_data.sql
psql -U your_username -d bhoomisetu_db -f db/sample-data/module9_notifications_sample_data.sql
psql -U your_username -d bhoomisetu_db -f db/sample-data/module9_support_chat_sample_data.sql
psql -U your_username -d bhoomisetu_db -f db/sample-data/module10_payments_sample_data.sql
```

### Option 3: Using Database GUI Tool

1. Open your database GUI tool (pgAdmin, DBeaver, etc.)
2. Connect to your database
3. Open each SQL file
4. Execute the SQL statements

### Option 4: Using Node.js Script (if available)

```bash
# If you have a script to run SQL files
node scripts/load-sample-data.js
```

## Execution Order

**Important**: Run the files in this order:

1. **module1_auth_sample_data.sql** (First)
   - Creates users, roles, and authentication data
   - Required for other modules

2. **module2_properties_sample_data.sql** (Second)
   - Creates properties that reference users from module 1
   - Required for home page and property listing testing

3. **module3_search_sample_data.sql** (Third)
   - Creates additional properties for search testing
   - Enhances search functionality testing

4. **module4_listing_features_sample_data.sql** (Optional)
   - Adds structured features for properties (property_features table)
   - Useful for Module 4 listing UX and future filtering

5. **module9_support_chat_sample_data.sql** (Optional)
   - Adds sample support chat sessions and messages

6. **module10_payments_sample_data.sql** (Optional)
   - Adds sample subscription plan, payment method, payment, and subscription transaction

## What Gets Created

### Module 1: Authentication
- 6 sample users (buyer, seller, agent, multi-role, CS, admin)
- 5 roles (buyer, seller, agent, customer_service, admin)
- User-role assignments
- Sample login sessions
- Sample OTP logs

### Module 2: Properties
- 6 properties in various states (live, pending_verification, draft)
- Different property types (apartment, house, villa, commercial, plot)
- Property images
- Various locations (Hyderabad, Bangalore, Mumbai, Delhi, Pune)

### Module 3: Search
- 7 additional properties for search testing
- Properties with special features (beach view, metro-connected, etc.)
- Various price ranges and locations
- Property images

### Module 4: Listing Features (Optional)
- Structured `property_features` rows for select properties
- Helps test “dynamic fields” / feature display

## Verification

After running the SQL files, verify the data:

```sql
-- Check users
SELECT id, email, full_name FROM users;

-- Check roles
SELECT * FROM roles;

-- Check properties
SELECT id, title, property_type, listing_type, status, price FROM properties;

-- Check property count
SELECT COUNT(*) FROM properties WHERE status = 'live';
```

## Sample User Credentials

For testing authentication:

- **Buyer**: buyer1@example.com / +919876543210
- **Seller**: seller1@example.com / +919876543211
- **Agent**: agent1@example.com / +919876543212
- **Multi-role**: multiuser@example.com / +919876543213
- **CS**: cs1@example.com / +919876543214
- **Admin**: admin@example.com / +919876543215

**Note**: These are sample users. You'll need to use OTP authentication to log in.

## Troubleshooting

### Error: "relation does not exist"
- Make sure database migrations have been run first
- Check that all tables exist in the database

### Error: "duplicate key value"
- The data might already exist
- Use `ON CONFLICT DO NOTHING` clauses (already included in SQL files)
- Or delete existing data first

### Error: "foreign key constraint"
- Make sure module1_auth_sample_data.sql runs first
- Check that user IDs in properties match user IDs in users table

## Cleanup (Optional)

To remove all sample data:

```sql
-- Remove in reverse order
DELETE FROM property_images WHERE property_id LIKE 'prop-%';
DELETE FROM properties WHERE id LIKE 'prop-%';
DELETE FROM otp_logs WHERE id LIKE 'otp-%';
DELETE FROM login_sessions WHERE id LIKE 'session-%';
DELETE FROM user_roles WHERE user_id LIKE 'user-%';
DELETE FROM users WHERE id LIKE 'user-%';
DELETE FROM roles WHERE id LIKE 'role-%';
```

## Notes

- All IDs use prefixes (user-, prop-, role-, etc.) for easy identification
- Sample data includes realistic Indian locations and phone numbers
- Property prices are in INR (Indian Rupees)
- Image URLs use Unsplash placeholder images
- All timestamps use NOW() for current date/time

---

**Last Updated**: 2024-01-14

