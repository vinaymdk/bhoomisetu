# Module 4: Seller Property Listing - Testing Checklist

## Web
- [ ] Login as **Seller** (`seller1@example.com`)
- [ ] Verify header shows **My Listings** and **List Property**
- [ ] Create listing with:
  - 1+ images (upload)
  - title/address/city/state/price/area
  - optional lat/long via “Use my location”
  - state dropdown (all Indian states)
  - area unit (sqft/sqm/acre/sqyrd)
  - Mapbox location lookup (backend `/locations/geocode`)
- [ ] Confirm redirect to **My Listings**
- [ ] Submit a **draft** listing for verification
- [ ] Verify status becomes `pending_verification`
- [ ] Confirm unauthenticated user cannot access `/list-property` or `/my-listings`
- [ ] Confirm authenticated **buyer** cannot access seller pages (redirects)

## Mobile
- [ ] Login as **Seller** (`seller1@example.com`)
- [ ] Open **List** tab → My Listings should load
- [ ] Tap **Create** → create listing with photos + required fields
- [ ] Verify dropdowns (area unit, bedrooms, bathrooms)
- [ ] Use **Search location (Mapbox)** and verify fields auto-fill
- [ ] Save listing → should return to My Listings and show it as `draft`
- [ ] Submit draft → should become `pending_verification`
- [ ] Login as **Buyer** → List tab should show role warning (no access)

## Sample Data
- [ ] Load module 1–3 data: `./scripts/load-sample-data.sh`
- [ ] Load module 4 features (optional): `./scripts/load-module4-sample-data.sh`


