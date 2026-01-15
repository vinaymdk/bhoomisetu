# SQL Schema Fixes & Mobile Bottom Sheet Fix

## Issues Fixed

### 1. SQL Sample Data Schema Mismatches

**Problem**: SQL files were using incorrect column names and types that didn't match the actual database schema.

**Fixes Applied**:

#### Module 1 (Auth) Fixes:
- ✅ Changed `users.id` from string to UUID
- ✅ Changed `users.email` to `users.primary_email`
- ✅ Changed `users.phone` to `users.primary_phone`
- ✅ Changed `users.name` to `users.full_name`
- ✅ Changed `roles.id` from string to SERIAL (integer)
- ✅ Use `roles.code` instead of `roles.id` for role identification
- ✅ Changed `user_roles.role_id` to reference integer role IDs
- ✅ Removed `otp_logs.user_id` (doesn't exist in schema)
- ✅ Updated `otp_logs` to use `channel`, `destination`, `purpose` only
- ✅ Updated `login_sessions` to include required fields (`refresh_token_hash`, `login_provider`)

#### Module 2 & 3 (Properties) Fixes:
- ✅ Changed `properties.id` from string to UUID
- ✅ Changed `properties.location_address` to `properties.address`
- ✅ Changed nested location object to flat columns: `city`, `state`, `pincode`, `locality`, `landmark`
- ✅ Changed `property_images.order` to `property_images.display_order`
- ✅ Updated all UUIDs to use proper UUID format
- ✅ Updated all DECIMAL values to use proper precision

### 2. Mobile Bottom Sheet Overflow Fix

**Problem**: "BOTTOM OVERFLOWED BY 279 PIXELS" error in filter bottom sheet.

**Root Cause**: The filter sheet Column was trying to take infinite height when used inside the main Column.

**Fix Applied**:
- ✅ Added `mainAxisSize: MainAxisSize.min` to the filter sheet Column
- ✅ Wrapped filter sheet in Container with `maxHeight` constraint (60% of screen height)
- ✅ Ensures filter sheet is scrollable and doesn't overflow

**Code Changes**:
```dart
// Before
if (_showFilters) _buildFiltersSheet(),

// After
if (_showFilters)
  Container(
    constraints: BoxConstraints(
      maxHeight: MediaQuery.of(context).size.height * 0.6,
    ),
    child: _buildFiltersSheet(),
  ),
```

And in `_buildFiltersSheet()`:
```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  mainAxisSize: MainAxisSize.min,  // Added this
  children: [
```

---

## Updated SQL Files

All three SQL sample data files have been completely rewritten to match the actual database schema:

1. ✅ `db/sample-data/module1_auth_sample_data.sql`
2. ✅ `db/sample-data/module2_properties_sample_data.sql`
3. ✅ `db/sample-data/module3_search_sample_data.sql`

---

## Testing

### SQL Files
1. Run the load script:
   ```bash
   ./scripts/load-sample-data.sh
   ```

2. Verify data loaded:
   ```sql
   SELECT COUNT(*) FROM users;
   SELECT COUNT(*) FROM properties;
   SELECT COUNT(*) FROM roles;
   ```

### Mobile Bottom Sheet
1. Open search screen
2. Tap filter icon
3. Verify filter sheet opens without overflow
4. Scroll through filters
5. Verify all filters are accessible

---

## Schema Reference

### Users Table
- `id`: UUID (not string)
- `primary_email`: VARCHAR(255) (not `email`)
- `primary_phone`: VARCHAR(32) (not `phone`)
- `full_name`: VARCHAR(255) (not `name`)
- `status`: VARCHAR(20), default 'pending'
- `fraud_risk_score`: SMALLINT (0-100)

### Roles Table
- `id`: SERIAL (integer, auto-increment)
- `code`: VARCHAR(64) UNIQUE (use this for role identification)
- `name`: VARCHAR(128)
- Roles are pre-seeded in migration

### Properties Table
- `id`: UUID
- `address`: TEXT (not `location_address`)
- `city`, `state`, `pincode`, `locality`, `landmark`: Separate columns
- `latitude`, `longitude`: DECIMAL(10,8) and DECIMAL(11,8)

### Property Images Table
- `id`: UUID
- `display_order`: INT (not `order` - reserved word)
- `is_primary`: BOOLEAN

---

**Status**: ✅ **ALL FIXES APPLIED**

**Files Modified**:
- `db/sample-data/module1_auth_sample_data.sql`
- `db/sample-data/module2_properties_sample_data.sql`
- `db/sample-data/module3_search_sample_data.sql`
- `mobile/lib/screens/search/search_screen.dart`

---

**Last Updated**: 2024-01-14

