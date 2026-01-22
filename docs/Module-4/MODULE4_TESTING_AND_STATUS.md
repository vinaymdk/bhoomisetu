# Module 4: Seller Property Listing - Testing Checklist

## Status / Notes (Jan 19, 2026)
- Code updates applied for form validation + submit gating, Mapbox drag marker support, and AI filter removal refresh.
- Backend app config now derives `apiBaseUrl` from environment/request host to avoid hardcoded IPs.
- Manual testing still required; use the checklist below for web + mobile.

## Web
- [ ] Login as **Seller** (`seller1@example.com`)
- [ ] Verify header shows **My Listings** and **List Property**
- [ ] Create listing with:
  - 1+ images (upload)
  - drag-and-drop reorder in web grid
  - remove image button visibility + functionality
  - title/address/city/state/price/area
  - optional lat/long via “Use my location”
  - state dropdown (all Indian states)
  - area unit (sqft/sqm/acre/sqyrd)
  - Mapbox location lookup (backend `/locations/geocode`)
- [ ] Use Mapbox map picker and click to update address
- [ ] Drag map marker to update coordinates and address
- [ ] Select autocomplete suggestion and ensure list hides
- [ ] Search → AI extracted filters show and can be removed (web)
- [ ] Edit listing and reorder images (up/down)
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
- [ ] Use **Pick on map** and verify fields auto-fill
- [ ] Drag marker to update coordinates and address
- [ ] Search → AI extracted filters show and can be removed (mobile)
- [ ] Edit listing and reorder images (up/down)
- [ ] Save listing → should return to My Listings and show it as `draft`
- [ ] Submit draft → should become `pending_verification`
- [ ] Login as **Buyer** → List tab should show role warning (no access)

## Sample Data
- [ ] Load module 1–3 data: `./scripts/load-sample-data.sh`
- [ ] Load module 4 features (optional): `./scripts/load-module4-sample-data.sh`


